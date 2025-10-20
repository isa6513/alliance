
variable "staging_db_password" {
  description = "Password for the staging RDS postgres user"
  type        = string
  sensitive   = true
}

# --------------------------
# STAGING EC2 INSTANCE + EIP
# --------------------------
resource "aws_instance" "app_server_staging" {
  ami                         = "ami-05572e392e80aee89"
  instance_type               = "t3a.medium"
  subnet_id                   = module.vpc.public_subnets[0]
  vpc_security_group_ids      = [aws_security_group.ec2_security_group.id] # reuse shared EC2 SG
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name  # reuse same profile
  associate_public_ip_address = true
  key_name                    = "ssh-key"

  user_data                   = ""
  user_data_replace_on_change = true

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true
    tags = {
      Name = "AllianceStagingServerRoot"
    }
  }

  tags = {
    Name        = "AllianceStagingServerInstance"
    Environment = "staging"
  }

  lifecycle {
    ignore_changes = [
      associate_public_ip_address,
    ]
  }
}

resource "aws_eip" "app_eip_staging" {
  instance = aws_instance.app_server_staging.id
  vpc      = true

  tags = {
    Name        = "AllianceStagingEIP"
    Environment = "staging"
  }
}

# --------------------------
# STAGING RDS (separate SG)
# --------------------------
resource "aws_security_group" "rds_staging" {
  name   = "alliance_rds_staging"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_security_group.id] # allow from shared EC2 SG
  }

  # Typically egress is not required for RDS SG, but kept symmetric
  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "alliance_rds_staging"
    Environment = "staging"
  }
}

resource "aws_db_subnet_group" "alliance_staging" {
  name       = "alliance-staging"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name        = "alliance-staging"
    Environment = "staging"
  }
}

resource "aws_db_parameter_group" "alliance_staging" {
  name   = "alliance-staging"
  family = "postgres17"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  tags = {
    Name        = "alliance-staging"
    Environment = "staging"
  }
}

resource "random_id" "staging_db_suffix" {
  byte_length = 3
}

resource "aws_db_instance" "alliance_staging" {
  identifier             = "alliance-staging"
  db_name                = "alliance_staging"
  instance_class         = "db.t3.micro"
  allocated_storage      = 10
  engine                 = "postgres"
  engine_version         = "17"
  username               = "edu"
  password               = var.staging_db_password

  db_subnet_group_name   = aws_db_subnet_group.alliance_staging.name
  vpc_security_group_ids = [aws_security_group.rds_staging.id]
  parameter_group_name   = aws_db_parameter_group.alliance_staging.name
  publicly_accessible    = false

  deletion_protection        = true
  skip_final_snapshot        = false
  final_snapshot_identifier  = "alliance-staging-final-${random_id.staging_db_suffix.hex}"

  backup_retention_period = 7
  copy_tags_to_snapshot   = true

  tags = {
    Name        = "alliance-staging"
    Environment = "staging"
  }
}

# --------------------------
# STAGING S3 BUCKET
# --------------------------
resource "random_id" "staging_bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "staging_assets" {
  bucket        = "alliance-assets-staging-${random_id.staging_bucket_suffix.hex}"
  force_destroy = true

  tags = {
    Name        = "alliance-staging-assets"
    Environment = "staging"
  }
}

resource "aws_s3_bucket_public_access_block" "staging_assets" {
  bucket                  = aws_s3_bucket.staging_assets.id
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "staging_assets" {
  bucket = aws_s3_bucket.staging_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ----------------------------------------------------
# Attach staging bucket access to the SAME EC2 role
# (so prod/dev policy remains unchanged)
# ----------------------------------------------------
resource "aws_iam_role_policy" "ec2_s3_policy_staging" {
  name = "ec2-s3-access-staging"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
      Effect   = "Allow"
      Resource = [
        aws_s3_bucket.staging_assets.arn,
        "${aws_s3_bucket.staging_assets.arn}/*"
      ]
    }]
  })
}
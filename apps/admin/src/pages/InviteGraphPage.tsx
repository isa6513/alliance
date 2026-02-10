import {
  OnetimeInviteDto,
  userGetOnetimeInvites,
  userList,
  UserDto,
} from "@alliance/shared/client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  userId?: number;
  displayName: string;
  profilePicture: string | null;
  isCenter?: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const NODE_RADIUS = 20;
const CENTER_RADIUS = 14;

const InviteGraphPage = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [invites, setInvites] = useState<OnetimeInviteDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userList(), userGetOnetimeInvites()]).then(
      ([usersRes, invitesRes]) => {
        setUsers(usersRes.data ?? []);
        setInvites(invitesRes.data ?? []);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (loading || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Build the graph data
    const usedInvites = invites.filter(
      (inv) => inv.status === "link_used" && inv.invitedUserId
    );

    // Users 7 and 10 are treated as the root node
    const ROOT_USER_IDS = new Set([7, 10]);
    const resolveNodeId = (userId: number) =>
      ROOT_USER_IDS.has(userId) ? "center" : `user-${userId}`;

    // Build nodes for all users (excluding root users, they become the center)
    const nodes: GraphNode[] = users
      .filter((u) => !ROOT_USER_IDS.has(u.id))
      .map((u) => ({
        id: `user-${u.id}`,
        userId: u.id,
        displayName: u.anonymous ? "Someone" : u.name,
        profilePicture: u.profilePicture,
      }));

    // Add center node (represents root users + uninvited)
    const rootUsers = users.filter((u) => ROOT_USER_IDS.has(u.id));
    const centerLabel = rootUsers
      .map((u) => (u.anonymous ? "Someone" : u.name))
      .join(" & ") || "Root";
    const centerNode: GraphNode = {
      id: "center",
      displayName: centerLabel,
      profilePicture: null,
      isCenter: true,
    };
    nodes.push(centerNode);

    // Build links from both invite system and referredBy, deduplicating
    const linkSet = new Set<string>(); // "sourceId->targetId"
    const links: GraphLink[] = [];

    const addLink = (sourceId: string, targetId: string) => {
      const key = `${sourceId}->${targetId}`;
      if (linkSet.has(key)) return;
      linkSet.add(key);
      links.push({ source: sourceId, target: targetId });
    };

    // Links from OnetimeInvite data
    for (const inv of usedInvites) {
      if (inv.invitingUser && inv.invitedUserId) {
        const src = resolveNodeId(inv.invitingUser.id);
        const tgt = resolveNodeId(inv.invitedUserId);
        if (src !== tgt) addLink(src, tgt);
      }
    }

    // Links from referredBy relation
    for (const u of users) {
      if (ROOT_USER_IDS.has(u.id)) continue;
      const referredById = (u as UserDto & { referredById?: number | null }).referredById;
      if (referredById != null) {
        const src = resolveNodeId(referredById);
        const tgt = resolveNodeId(u.id);
        if (src !== tgt) addLink(src, tgt);
      }
    }

    // Track which users have an incoming link (were referred/invited)
    const linkedTargets = new Set<string>();
    for (const l of links) {
      const tgt = typeof l.target === "string" ? l.target : l.target.id;
      linkedTargets.add(tgt);
    }

    // Users without any incoming link go to center
    for (const u of users) {
      if (ROOT_USER_IDS.has(u.id)) continue;
      if (!linkedTargets.has(`user-${u.id}`)) {
        addLink("center", `user-${u.id}`);
      }
    }

    // Build adjacency lists (source -> targets, target -> source)
    const childrenMap = new Map<string, Set<string>>();
    const parentMap = new Map<string, string>();
    for (const l of links) {
      const src = typeof l.source === "string" ? l.source : l.source.id;
      const tgt = typeof l.target === "string" ? l.target : l.target.id;
      if (!childrenMap.has(src)) childrenMap.set(src, new Set());
      childrenMap.get(src)!.add(tgt);
      parentMap.set(tgt, src);
    }

    // Collect all descendants (children, grandchildren, etc.)
    function getDescendants(nodeId: string): Set<string> {
      const result = new Set<string>();
      const stack = [nodeId];
      while (stack.length) {
        const current = stack.pop()!;
        const children = childrenMap.get(current);
        if (!children) continue;
        for (const child of children) {
          if (!result.has(child)) {
            result.add(child);
            stack.push(child);
          }
        }
      }
      return result;
    }

    // Walk up the parent chain to root
    function getAncestors(nodeId: string): Set<string> {
      const result = new Set<string>();
      let current = parentMap.get(nodeId);
      while (current && !result.has(current)) {
        result.add(current);
        current = parentMap.get(current);
      }
      return result;
    }

    let selectedNodeId: string | null = null;

    function applyHighlight() {
      if (!selectedNodeId) {
        // Reset everything to default
        node.select("circle")
          .attr("opacity", 1)
          .attr("stroke", (d: GraphNode) => (d.isCenter ? "#9ca3af" : "#d1d5db"))
          .attr("stroke-width", (d: GraphNode) => (d.isCenter ? 2 : 1.5));
        node.selectAll("text").attr("opacity", 1);
        link
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", 0.6)
          .attr("marker-end", "url(#arrowhead)");
        return;
      }

      const descendants = getDescendants(selectedNodeId);
      const ancestors = getAncestors(selectedNodeId);
      const allHighlighted = new Set([selectedNodeId, ...descendants, ...ancestors]);

      // Dim non-highlighted nodes
      node.select("circle")
        .attr("opacity", (d: GraphNode) => allHighlighted.has(d.id) ? 1 : 0.15)
        .attr("stroke", (d: GraphNode) => {
          if (d.id === selectedNodeId) return "#3b82f6";
          if (ancestors.has(d.id)) return "#f59e0b";
          if (descendants.has(d.id)) return "#60a5fa";
          return d.isCenter ? "#9ca3af" : "#d1d5db";
        })
        .attr("stroke-width", (d: GraphNode) => {
          if (d.id === selectedNodeId) return 3;
          if (allHighlighted.has(d.id)) return 2.5;
          return d.isCenter ? 2 : 1.5;
        });
      node.selectAll("text")
        .attr("opacity", (d: unknown) => allHighlighted.has((d as GraphNode).id) ? 1 : 0.15);

      // Determine if a link is part of the highlighted subgraph and its color
      function linkHighlightColor(d: GraphLink): string | null {
        const src = (d.source as GraphNode).id;
        const tgt = (d.target as GraphNode).id;
        // Ancestor chain: both endpoints in ancestors+selected, and link goes toward selected
        if ((ancestors.has(src) || src === selectedNodeId) && (ancestors.has(tgt) || tgt === selectedNodeId)) {
          return "#f59e0b";
        }
        // Descendant tree: both endpoints in descendants+selected
        if ((descendants.has(src) || src === selectedNodeId) && (descendants.has(tgt) || tgt === selectedNodeId)) {
          return "#3b82f6";
        }
        return null;
      }

      // Highlight links in the subgraph
      link
        .attr("stroke", (d: GraphLink) => linkHighlightColor(d) ?? "#ccc")
        .attr("stroke-width", (d: GraphLink) => linkHighlightColor(d) ? 2.5 : 1.5)
        .attr("stroke-opacity", (d: GraphLink) => linkHighlightColor(d) ? 1 : 0.1)
        .attr("marker-end", (d: GraphLink) => {
          const color = linkHighlightColor(d);
          if (color === "#f59e0b") return "url(#arrowhead-ancestor)";
          if (color === "#3b82f6") return "url(#arrowhead-highlight)";
          return "url(#arrowhead)";
        });
    }

    // Create defs for clip paths and patterns
    const defs = svg.append("defs");

    // Clip path for user nodes
    defs
      .append("clipPath")
      .attr("id", "clip-node")
      .append("circle")
      .attr("r", NODE_RADIUS);

    defs
      .append("clipPath")
      .attr("id", "clip-center")
      .append("circle")
      .attr("r", CENTER_RADIUS);

    // Create image patterns for each user
    for (const node of nodes) {
      if (node.profilePicture && !node.isCenter) {
        defs
          .append("pattern")
          .attr("id", `pfp-${node.id}`)
          .attr("width", 1)
          .attr("height", 1)
          .append("image")
          .attr("href", node.profilePicture)
          .attr("width", NODE_RADIUS * 2)
          .attr("height", NODE_RADIUS * 2)
          .attr("preserveAspectRatio", "xMidYMid slice");
      }
    }

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(60)
      )
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(NODE_RADIUS + 5))
      .stop();

    // Pre-warm simulation so layout is stable before rendering
    const tickCount = 500
    for (let i = 0; i < tickCount; i++) simulation.tick();

    // Draw links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6);

    // Draw arrow markers
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", NODE_RADIUS + 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#ccc");

    defs
      .append("marker")
      .attr("id", "arrowhead-highlight")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", NODE_RADIUS + 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#3b82f6");

    defs
      .append("marker")
      .attr("id", "arrowhead-ancestor")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", NODE_RADIUS + 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#f59e0b");

    link.attr("marker-end", "url(#arrowhead)");

    // Draw nodes
    const node = g
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer");

    // Background circle (fallback / border)
    node
      .append("circle")
      .attr("r", (d) => (d.isCenter ? CENTER_RADIUS : NODE_RADIUS))
      .attr("fill", (d) => {
        if (d.isCenter) return "#e5e7eb";
        if (d.profilePicture) return `url(#pfp-${d.id})`;
        return "#e5e7eb";
      })
      .attr("stroke", (d) => (d.isCenter ? "#9ca3af" : "#d1d5db"))
      .attr("stroke-width", (d) => (d.isCenter ? 2 : 1.5));

    // Fallback icon for users without pfp (not center)
    node
      .filter((d) => !d.profilePicture && !d.isCenter)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", 16)
      .attr("fill", "#9ca3af")
      .text("?");

    // Center node label
    node
      .filter((d) => !!d.isCenter)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", 9)
      .attr("font-weight", "bold")
      .attr("fill", "#6b7280")
      .text("ROOT");

    // Name labels
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.isCenter ? CENTER_RADIUS + 14 : NODE_RADIUS + 14))
      .attr("font-size", 10)
      .attr("fill", "#374151")
      .text((d) => (d.isCenter ? "" : d.displayName));

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Click to highlight subgraph
    node.on("click", (event, d) => {
      event.stopPropagation();
      if (selectedNodeId === d.id) {
        selectedNodeId = null;
      } else {
        selectedNodeId = d.id;
      }
      applyHighlight();
    });

    // Click empty space to clear
    svg.on("click", () => {
      selectedNodeId = null;
      applyHighlight();
    });

    // Tooltip on hover
    node.append("title").text((d) => d.displayName);

    // Position update helper
    function updatePositions() {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }

    // Apply pre-warmed positions
    updatePositions();

    // Re-enable simulation for interactive dragging
    simulation.on("tick", updatePositions).restart();

    // Initial zoom to fit
    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.8)
        .translate(-width / 2, -height / 2)
    );

    return () => {
      simulation.stop();
    };
  }, [loading, users, invites]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading graph...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="p-4 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-bold">Invite Graph</h2>
        <p className="text-sm text-gray-500">
          {users.length} users, {invites.filter((i) => i.status === "link_used").length} used invites
        </p>
      </div>
      <svg ref={svgRef} className="flex-1 w-full min-h-0" />
    </div>
  );
};

export default InviteGraphPage;

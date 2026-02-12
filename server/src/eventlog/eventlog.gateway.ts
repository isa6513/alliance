import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { EventLog } from './event-log.entity';
import { EventLogEvents } from './eventlog.events';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/event-log',
})
export class EventLogGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventLogGateway');

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.eventEmitter.on(
      EventLogEvents.Created,
      this.handleEventLogCreated.bind(this),
    );
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    client.leave('event-log-feed');
  }

  @SubscribeMessage('subscribe-event-log')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    client.join('event-log-feed');
    this.logger.log(`Client ${client.id} subscribed to event log feed`);
  }

  @SubscribeMessage('unsubscribe-event-log')
  handleUnsubscribe(@ConnectedSocket() client: Socket) {
    client.leave('event-log-feed');
    this.logger.log(`Client ${client.id} unsubscribed from event log feed`);
  }

  private handleEventLogCreated(eventLog: EventLog) {
    this.server.to('event-log-feed').emit('event-log-new', eventLog);
    this.logger.log(`Broadcast new event log: ${eventLog.event}`);
  }
}

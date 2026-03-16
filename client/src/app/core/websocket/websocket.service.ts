import { Injectable, inject, signal, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthState } from '../auth/auth.state';
import { WsMessage, WsMessageType } from './websocket.types';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private readonly authState = inject(AuthState);
  private readonly ngZone = inject(NgZone);

  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;

  private readonly _connected = signal(false);
  private readonly _messages = new Subject<WsMessage>();

  readonly connected = this._connected.asReadonly();
  readonly messages$ = this._messages.asObservable();

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const token = this.authState.accessToken();
    if (!token) return;

    const url = `${environment.wsBaseUrl}?token=${token}`;

    this.ngZone.runOutsideAngular(() => {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.ngZone.run(() => {
          this._connected.set(true);
          this.reconnectAttempts = 0;
        });
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);
          this.ngZone.run(() => this._messages.next(message));
        } catch {
          // ignore malformed messages
        }
      };

      this.socket.onclose = () => {
        this.ngZone.run(() => {
          this._connected.set(false);
          this.attemptReconnect();
        });
      };

      this.socket.onerror = () => {
        this.socket?.close();
      };
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this._connected.set(false);
  }

  send(message: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  subscribe(channel: string): void {
    this.send({ action: 'subscribe', channel });
  }

  unsubscribe(channel: string): void {
    this.send({ action: 'unsubscribe', channel });
  }

  onMessage(type: WsMessageType) {
    return this.messages$.pipe(
      filter((msg) => msg.type === type),
      map((msg) => msg.data)
    );
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay);
  }

  private startHeartbeat(): void {
    const interval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      } else {
        clearInterval(interval);
      }
    }, 30000);
  }
}

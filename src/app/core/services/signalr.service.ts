import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hubConnection: signalR.HubConnection | undefined;
  private grupo = "admin";

  private socket = `${environment.socket}`;

  constructor(private http: HttpClient) { }

  public iniciarConexion(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.socket}/orden-signal`) // Ajusta según tu backend
      // .configureLogging(signalR.LogLevel.Trace)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log(`[Socket] Conectado al Hub`)
        this.hubConnection?.invoke('UnirseAlAdmin')
        .then(() => {
          console.log('[Socket] Suscrito al grupo: admin');
        })
        .catch(err => console.error('[Socket] Error al suscribirse al grupo admin:', err));
      })
      .catch(err => console.error('[Socket] Error al conectar:', err));

    this.hubConnection.onreconnected(connectionId => {
      if (this.grupo) {
        this.hubConnection?.invoke('UnirseAlAdmin')
        .then(() => {
          console.log('[Socket] Suscrito al grupo: admin');
        })
        .catch(err => console.error('[Socket] Error al suscribirse al grupo admin:', err));
      }
    });
  }

  public escucharMensajes(callback: (mensaje: string) => void): void {
    this.hubConnection?.on('RecibirMensaje', callback);
  }

  public listenOrders(callback: (response: any) => void): void {
    this.hubConnection?.on('order', callback);
  }

}

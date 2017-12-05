import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.css']
})
export class ServerComponent implements OnInit {
  serverId:number = 10;
  serverStatus: string = 'offline'
  
  getServerStatus():string{
    return this.serverStatus;
  }
  getServerId():number{
    return this.serverId;
  }
  constructor() {
    this.serverStatus = Math.random() > 0.5 ? 'online' : "offline";
   }
  
  getColor():any{
    return this.serverStatus === 'online' ? 'green': 'red' ;
  }
  ngOnInit() {
  }

}

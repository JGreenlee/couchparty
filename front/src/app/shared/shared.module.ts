import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketStatusComponent } from '../components/socket-status/socket-status.component';
import { DisconnectAlertComponent } from './disconnect-alert/disconnect-alert.component';

@NgModule({
    imports: [
        CommonModule
     ],
    declarations: [
        SocketStatusComponent,
        DisconnectAlertComponent
    ],
    exports: [
        SocketStatusComponent,
        DisconnectAlertComponent
    ]
})
export class SharedModule {}
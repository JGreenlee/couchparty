import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketStatusComponent } from '../components/socket-status/socket-status.component';
import { DisconnectAlertComponent } from './disconnect-alert/disconnect-alert.component';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SocketStatusComponent,
        DisconnectAlertComponent,
        LoaderComponent
    ],
    exports: [
        SocketStatusComponent,
        DisconnectAlertComponent,
        LoaderComponent
    ]
})
export class SharedModule { }
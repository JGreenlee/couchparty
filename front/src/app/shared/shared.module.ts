import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketStatusComponent } from '../components/socket-status/socket-status.component';

@NgModule({
    imports: [
        CommonModule
     ],
    declarations: [
        SocketStatusComponent
    ],
    exports: [
        SocketStatusComponent
    ]
})
export class SharedModule {}
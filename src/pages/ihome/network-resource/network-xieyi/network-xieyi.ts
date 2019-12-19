import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-network-xieyi',
    templateUrl: 'network-xieyi.html',
})
export class ModalContentPage {
    constructor(private viewCtrl: ViewController) {

    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}
import { Component } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared-module';
import { addIcons } from 'ionicons';
import { warning } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

addIcons({ warning });

@Component({
  selector: 'app-california-warning-dialog',
  templateUrl: './california-warning-dialog.component.html',
  styleUrls: ['./california-warning-dialog.component.scss'],
  standalone: true,
  imports: [SharedModule, CommonModule, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent]
})
export class CaliforniaWarningDialogComponent {

  constructor(private modalCtrl: ModalController) { }

  okay() {
    this.modalCtrl.dismiss();
  }
}

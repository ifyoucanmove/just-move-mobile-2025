import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared-module';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

addIcons({
  closeOutline
});

@Component({
  selector: 'app-view-description',
  templateUrl: './view-description.component.html',
  styleUrls: ['./view-description.component.scss'],
  standalone: true,
  imports: [SharedModule, CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent]
})
export class ViewDescriptionComponent implements OnInit {

  @Input() description: string = '';

  constructor(private modalCtrl: ModalController) { }

  ngOnInit(): void {
  }

  close() {
    this.modalCtrl.dismiss();
  }
}

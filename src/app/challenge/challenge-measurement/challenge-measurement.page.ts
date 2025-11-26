import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-challenge-measurement',
  templateUrl: './challenge-measurement.page.html',
  styleUrls: ['./challenge-measurement.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ChallengeMeasurementPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

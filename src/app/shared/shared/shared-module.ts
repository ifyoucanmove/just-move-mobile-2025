import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonTitle,IonImg, 
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,IonSearchbar,
  IonToolbar,IonInput,IonButton, IonGrid, IonRow, IonCol, IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { beerOutline, chevronBackOutline, eyeOffOutline, eyeOutline, heartOutline, homeOutline, searchOutline, menuOutline, filterOutline, closeOutline, arrowBackOutline, chevronForwardOutline, logOutOutline } from 'ionicons/icons';

//add icon 
addIcons({
  chevronBackOutline,
  eyeOffOutline,
  eyeOutline,
  homeOutline,
  beerOutline,
  heartOutline,
  searchOutline,
  menuOutline,
  filterOutline,
  closeOutline,
  arrowBackOutline,
  chevronForwardOutline,
  logOutOutline
});

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,IonImg,IonInput,IonButton,IonSearchbar,
    IonGrid, IonRow, IonCol, IonIcon, IonText, IonTab, IonTabBar, IonTabButton, IonTabs
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,IonImg,IonInput,IonButton,IonSearchbar,
    IonGrid, IonRow, IonCol, IonIcon, IonText, IonTab, IonTabBar, IonTabButton, IonTabs
  ]
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonTitle,IonImg, 
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,IonSearchbar,IonFooter, IonDatetime, IonAccordionGroup, IonAccordion,
  IonToolbar,IonInput,IonButton, IonGrid, IonRow, IonCol, IonIcon, IonText, IonSkeletonText, IonLabel, IonCard, IonThumbnail, IonItem, IonList, IonBadge, IonBackButton, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { beerOutline, chevronBackOutline, eyeOffOutline, eyeOutline, heartOutline, homeOutline, searchOutline, menuOutline, filterOutline, closeOutline, arrowBackOutline, chevronForwardOutline, logOutOutline, arrowForwardOutline } from 'ionicons/icons';
import { HttpClientModule } from '@angular/common/http';
import { ArrayToCommaSeparatedPipe } from 'src/app/pipes/array-to-comma-separated.pipe';

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
  logOutOutline,
  arrowForwardOutline
});

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,HttpClientModule,
    IonContent, IonHeader, IonTitle, IonToolbar,IonImg,IonInput,IonButton,IonSearchbar,
    IonGrid, IonRow, IonCol, IonIcon, IonText, IonTab, IonTabBar, IonTabButton, IonTabs,
    IonSkeletonText,IonLabel,IonCard,IonThumbnail,IonItem,IonList,IonBadge,IonFooter,
    IonBackButton,IonDatetime,IonAccordionGroup,IonAccordion,IonSpinner,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,HttpClientModule,
    IonContent, IonHeader, IonTitle, IonToolbar,IonImg,IonInput,IonButton,IonSearchbar,
    IonGrid, IonRow, IonCol, IonIcon, IonText, IonTab, IonTabBar, IonTabButton, IonTabs,
    IonSkeletonText,IonLabel,IonCard,IonThumbnail,IonItem,IonList,IonBadge,IonFooter,
    IonBackButton,IonDatetime,IonAccordionGroup,IonAccordion
  ]
})
export class SharedModule { }

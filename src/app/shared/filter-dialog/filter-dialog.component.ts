import { Component, OnInit, Input } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared-module';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

addIcons({
  closeOutline,
  checkmarkOutline
});

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss'],
  standalone: true,
  imports: [SharedModule, CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent]
})
export class FilterDialogComponent implements OnInit {

  @Input() categoryList: any[] = [];
  @Input() selectedCategories: Set<string> = new Set();

  tempSelectedCategories: Set<string> = new Set();

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    // Initialize temp selection with current selected categories
    this.tempSelectedCategories = new Set(this.selectedCategories);
  }

  toggleCategory(category: any) {
    const categoryValue = category.value;
    if (this.tempSelectedCategories.has(categoryValue)) {
      this.tempSelectedCategories.delete(categoryValue);
    } else {
      this.tempSelectedCategories.add(categoryValue);
    }
  }

  isCategorySelected(category: any): boolean {
    return this.tempSelectedCategories.has(category.value);
  }

  applyFilters() {
    // Return selected categories when apply is clicked
    this.modalCtrl.dismiss({ selectedCategories: Array.from(this.tempSelectedCategories) });
  }

  clearFilters() {
    this.tempSelectedCategories.clear();
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

}

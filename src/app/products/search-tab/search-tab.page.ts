import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { Common } from 'src/app/services/common';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar.component';

@Component({
  selector: 'app-search-tab',
  templateUrl: './search-tab.page.html',
  styleUrls: ['./search-tab.page.scss'],
  standalone: true,
  imports: [SharedModule,SidebarComponent]
})
export class SearchTabPage implements OnInit {

  constructor(public common:Common) { }

  ngOnInit() {
  }

  toggleSidebar() {
    this.common.isSidebarOpen = !this.common.isSidebarOpen;
  }

}

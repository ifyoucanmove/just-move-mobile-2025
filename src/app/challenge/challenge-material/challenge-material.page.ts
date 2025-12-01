import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { Challenges } from 'src/app/services/challenges';
import { ActivatedRoute } from '@angular/router';
import { Customer } from 'src/app/services/customer';

@Component({
  selector: 'app-challenge-material',
  templateUrl: './challenge-material.page.html',
  styleUrls: ['./challenge-material.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class ChallengeMaterialPage implements OnInit {

  materialPDFImage1: string= '';
  materialPDFTitle1: string = '';
  materialPDFUrl1: string = '';

  materialPDFImage2: string = '';
  materialPDFTitle2: string = '';
  materialPDFUrl2: string = '';

  materialPDFImage3: string = '';
  materialPDFTitle3: string = '';
  materialPDFUrl3: string = '';


  materialPDFImage4: string = '';
  materialPDFTitle4: string = '';
  materialPDFUrl4: string = '';

  materialPDFImage5: string = '';
  materialPDFTitle5: string = '';
  materialPDFUrl5: string = '';

  materialPDFImageSuper1: string = '';
  materialPDFTitleSuper1: string = '';
  materialPDFUrlSuper1: string = '';

  materialPDFImageSuper2: string = '';
  materialPDFTitleSuper2: string = '';
  materialPDFUrlSuper2: string = '';

  materialPDFImageSuper3: string = '';
  materialPDFTitleSuper3: string = '';
  materialPDFUrlSuper3: string = '';

  title: any;
  isSuperChallenge: boolean = false;
  loaded = false;
  loaded2 = false;
  loaded3 = false;
  loaded4 = false;
  loaded5 = false;

  constructor(
    private challengeService: Challenges,
    private route: ActivatedRoute,
    private customerService: Customer
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((res) => {
      this.loadDatas();
    });
  }

  loadDatas() {
    
    this.isSuperChallenge = this.customerService.isSuperChallenge;
    let selectedIndex = this.challengeService.selectedChallengeIndex;
    console.log("CHalleneg", this.challengeService.challengeDatas[
      selectedIndex
    ]);
    this.title = this.challengeService.challengeDatas[selectedIndex].dashTitle;
    this.materialPDFImage1 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFImage1;
    this.materialPDFTitle1 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFTitle1;
    this.materialPDFUrl1 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFUrl1;

    this.materialPDFImage2 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFImage2;
    this.materialPDFTitle2 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFTitle2;
    this.materialPDFUrl2 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFUrl2;

    this.materialPDFImage3 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFImage3;
    this.materialPDFTitle3 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFTitle3;
    this.materialPDFUrl3 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFUrl3;

    this.materialPDFImage4 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFImage4;
    this.materialPDFTitle4 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFTitle4;
    this.materialPDFUrl4 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFUrl4;

    this.materialPDFImage5 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFImage5;
    this.materialPDFTitle5 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFTitle5;
    this.materialPDFUrl5 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFUrl5;

    this.materialPDFImageSuper1 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFImageSuper1;
    this.materialPDFTitleSuper1 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFTitleSuper1;
    this.materialPDFUrlSuper1 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFUrlSuper1;

    this.materialPDFImageSuper2 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFImageSuper2;
    this.materialPDFTitleSuper2 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFTitleSuper2;
    this.materialPDFUrlSuper2 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFUrlSuper2;

    this.materialPDFImageSuper3 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFImageSuper3;
    this.materialPDFTitleSuper3 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFTitleSuper3;
    this.materialPDFUrlSuper3 = this.challengeService.challengeDatas[
      selectedIndex
    ].materialPDFUrlSuper3;
  }

  openUrl(url:string, tilte?: string) {
    window.open(url, "_system", "location=yes");

    let payload = {
      resource:"challenge-material" , type:"view", material:this.title ,  challengeId: this.challengeService.challengeDatas[this.challengeService.selectedChallengeIndex].id , module :"challenge"
    }
   }
}


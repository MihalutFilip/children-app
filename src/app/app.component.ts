import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationBar } from './enums/NavigationBar';
import { CustomField } from './domains/CustomField';
import { Group } from './domains/Group';
import { Child } from './domains/Child';
import { Lesson } from './domains/Lesson';
import { Score } from './domains/Score';
import { Utils } from './utils/utils';
import { saveAs } from 'file-saver';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  navigationSelected = NavigationBar.Home;
  customFields: CustomField[] = [];
  groups: Group[] = [];
  children: Child[] = [];
  lessons: Lesson[] = [];
  scores: Score[] = [];
  utils = new Utils();

  constructor(private service: AppService) {
    this.onImportDates();
  }

  changePage(navigation) {
    this.navigationSelected = navigation;
  }

  get navigation() {
    return NavigationBar;
  }

  onImportDates() {
    this.service.getDates().subscribe(dataFile => {
      let dates = this.utils.convertStringToObjects(dataFile.settings)
      this.customFields = dates.customFields;
      this.groups = dates.groups;
      this.children = dates.children;
      this.lessons = dates.lessons;
      this.scores = dates.scores;
    });
  }

  onExportDates() {
    let stringData = this.utils.convertObjectsToString({
      customFields: this.customFields,
      groups: this.groups,
      children: this.children,
      lessons: this.lessons,
      scores: this.scores
    });

    this.service.postDates(stringData).subscribe(data => {
      console.log("POST");
      console.log(data);
    });
  }
}

import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Group } from 'src/app/domains/Group';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Lesson } from 'src/app/domains/Lesson';
import { Child } from 'src/app/domains/Child';
import { Score } from 'src/app/domains/Score';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-scores-modal',
  templateUrl: './scores-modal.component.html',
  styleUrls: ['./scores-modal.component.scss']
})
export class ScoresModalComponent implements OnInit {
  @ViewChild('content',{static: false}) content : HTMLElement;
  @ViewChild('picker',{static: false}) picker : HTMLElement;
  @Input() isModalOpen: boolean;
  @Input() groups: Group[];
  @Output() onCloseModal: EventEmitter<Score[]> = new EventEmitter();
  selectedGroup: Group[];
  selectedLesson: Lesson[];
  selectedChildren: Child[];
  groupDropdownSettings = {};
  lessonDropdownSettings = {};
  childrenDropdownSettings = {};

  constructor(private modalService: NgbModal, private toastService: MessageService) { }

  ngOnInit() {
    this.groupDropdownSettings = <IDropdownSettings> {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      noDataAvailablePlaceholderText: 'Nu există grupe',
      searchPlaceholderText: 'Caută',
      closeDropDownOnSelection: true
    };

    this.lessonDropdownSettings = <IDropdownSettings> {
      singleSelection: true,
      idField: 'id',
      textField: 'text',
      allowSearchFilter: true,
      noDataAvailablePlaceholderText: 'Nu există lecții',
      searchPlaceholderText: 'Caută',
      closeDropDownOnSelection: true
    };

    this.childrenDropdownSettings = <IDropdownSettings> {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Selectează tot',
      unSelectAllText: 'Deselectează tot',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: true,
      noDataAvailablePlaceholderText: 'Nu există grupe',
      searchPlaceholderText: 'Caută'
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop : 'static',
      keyboard : false
    };
    if(changes['isModalOpen'])
      this.isModalOpen = changes['isModalOpen'].currentValue;
    if(this.isModalOpen) {
      this.lessons.sort((a: Lesson, b: Lesson) => {
        return b.date.getTime() - a.date.getTime();
      });
      this.selectedGroup = [];
      this.modalService.open(this.content, ngbModalOptions);      
    }
  }

  onClose() {
    this.isModalOpen = false; 
    this.onCloseModal.emit(null);
  }

  onSave() { 
    if(!this.isGroupSelected) {
      this.toastService.add({ severity: 'error', summary: 'Eroare', detail: 'Grupa nu e selectata' });
      return;
    }

    if(!this.isLessonSelected) {
      this.toastService.add({ severity: 'error', summary: 'Eroare', detail: 'Lecția nu e selectată' });
      return;
    }

    if(!this.isChildrenSelected) {
      this.toastService.add({ severity: 'error', summary: 'Eroare', detail: 'Copiii nu sunt selectați' });
      return;
    }

    if(this.isAnyScoresWithoutValue) {
      this.toastService.add({ severity: 'error', summary: 'Eroare', detail: 'Punctajele sunt fără valoare' });
      return;
    }

    let scores = [];
    this.selectedChildren.forEach(child => {
      this.customFields.forEach(customField => {
        scores.push(<Score>{
          childId: child.id,
          customFieldId: customField.id,
          lessonId: this.selectedLesson[0].id,
          value: customField.value
        });
      });
    });
  
    this.onCloseModal.emit(scores);
    this.toastService.add({ severity: 'success', summary: 'Info', detail: 'Punctaje adăugate cu succes' });
  }

  get isChildrenSelected() {
    return this.selectedChildren != undefined && this.selectedChildren.length > 0;
  }

  get isGroupSelected() {
    return this.selectedGroup != undefined && this.selectedGroup.length > 0;
  }

  get isLessonSelected() {
    return this.selectedLesson != undefined && this.selectedLesson.length > 0;
  }

  get isAnyScoresWithoutValue() {
    return !this.customFields.some(customField => customField.value);
  }

  get lessons() {
    if(!this.isGroupSelected)
      return [];
    return this.groups.find(group => group.id == this.selectedGroup[0].id).lessons;
  }

  get children() {
    if(!this.isGroupSelected)
      return [];
    return this.groups.find(group => group.id == this.selectedGroup[0].id).children;
  }

  get customFields() {
    if(!this.isGroupSelected)
      return [];
    return this.groups.find(group => group.id == this.selectedGroup[0].id).customFields;
  }

  onGroupSelect() {
      this.selectedLesson = [];
      this.selectedChildren = [];
  }
}

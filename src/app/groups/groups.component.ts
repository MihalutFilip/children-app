import { Component, OnInit, ViewChild, Input, ViewChildren, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { Child } from '../domains/Child';
import { Group } from '../domains/Group';
import { CustomField } from '../domains/CustomField';
import { ConfirmationDialogService } from '../modals/confirmation-dialog/confirmation-dialog.service';
import { MessageService } from 'primeng/api';
import { Utils } from '../utils/utils';
import { Score } from '../domains/Score';
import { saveAs } from 'file-saver';
import { Lesson } from '../domains/Lesson';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  providers: [MessageService]
})
export class GroupsComponent implements OnInit {
  @Input() customFields: CustomField[];
  @Input() children: Child[];
  @Input() lessons: Lesson[];
  @Input() groups: Group[];
  @Input() scores: Score[];
  @Output() onGroupsChanges: EventEmitter<any> = new EventEmitter();
  currentGroup: Group;
  isGroupModalOpen: boolean = false;
  isScoreModalOpen: boolean = false;
  isCustomFiledModalOpen: boolean = false;
  utils: Utils = new Utils();

  constructor(private confirmationDialogService: ConfirmationDialogService, private toastService: MessageService) { }

  ngOnInit() {
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if(changes['lessons'])
      this.lessons = changes['lessons'].currentValue;
  }

  addCumstomField() {
    this.isCustomFiledModalOpen = true;
  }

  addGroup() {
    this.currentGroup = new Group();
    this.isGroupModalOpen = true;
  }

  editGroup(group) {
    this.currentGroup = { ...group };
    this.isGroupModalOpen = true;
  }

  deleteGroup(group) {
    this.confirmationDialogService.confirm('Confirmare', 'Esti sigur ca vrei sa stergi grupa?').then((confirmed) => {
      if (confirmed) {
        let groupId = group.id;
        this.groups.splice(this.groups.indexOf(group), 1);

        // delete children from this group
        for (let i = 0; i < this.children.length; i++)
          if (this.children[i].groupId === groupId)
            this.children.splice(i--, 1);

            console.log(groupId);
            console.log(this.lessons);
        // delete lessons from this group
        for (let i = 0; i < this.lessons.length; i++)
          if (this.lessons[i].groupId === groupId) {        
            //delete scores from this lessons
            for (let j = 0; j < this.scores.length; j++)
              if (this.scores[j].lessonId === this.lessons[i].id)
                this.scores.splice(j--, 1);
            this.lessons.splice(i--, 1);
          }

        this.toastService.add({ severity: 'success', summary: 'Info', detail: 'Grupa a fost stearsa cu succes' });
      }
    });

    this.onAnyChange();
  }

  showOrHideTable(group: Group) {
    group.isExpanded = !group.isExpanded;
  }

  onGroupSave(group) {
    this.isGroupModalOpen = false;

    if (!group)
      return;

    if (group.id) {
      // We must update marks for each children, so must delete old data, and add new one
      let groupIndex = this.groups.findIndex(g => g.id == group.id);

      // Old Data
      let oldCustomFields = this.groups[groupIndex].customFields.filter(customField => !group.customFields.some(x => x.id == customField.id));
      this.groups[groupIndex].children.forEach(child => {
        let totalSum = 0;
        oldCustomFields.forEach(customField => {
          //delete scores 
          for (let i = 0; i < this.scores.length; i++)
              if (this.scores[i].customFieldId === customField.id && this.scores[i].childId === child.id)
                this.scores.splice(i--, 1);

          let markIndex = child.marks.findIndex(mark => mark.customField.id == customField.id);
          totalSum += child.marks[markIndex].value;
          child.marks.splice(markIndex, 1);
        });
        child.sumOfMarks -= totalSum;
      });

      //New data
      let newCustomFields = group.customFields.filter(customField => !this.groups[groupIndex].customFields.some(x => x.id == customField.id));
      this.groups[groupIndex].children.forEach(child => {
        newCustomFields.forEach(customField => {
          child.marks.push({ value: 0, customField: customField });
          // add to scores, as well
          this.scores.push(<Score> {childId: child.id, customFieldId: customField.id, value: 0});
        });
      });

      this.groups[groupIndex] = { ...group };
    }
    else {
      group.id = this.utils.findNewIdForGroup(this.groups);
      group.children = [];
      group.lessons = [];
      this.groups.push(group);
    }

    this.onAnyChange();
  }

  onChildAdded(child: Child) {   
    child.id = this.utils.findNewIdForChild(this.groups);
    child.iconColor = this.utils.randomColor(child.id);

    // populate scores with 0
    child.marks.forEach(mark => this.scores.push(<Score>{ childId: child.id, customFieldId: mark.customField.id, value: 0 }));
    this.children.push(child);
  }

  onChildDeleted(child: Child) {
    for (let i = 0; i < this.scores.length; i++)
        if (this.scores[i].childId === child.id)
            this.scores.splice(i--, 1);
    this.children.splice(this.children.indexOf(child), 1);
  }

  addScores() {
    this.isScoreModalOpen = true;
  }

  onScoresSave(scores) {
    if (!scores) {
      this.isScoreModalOpen = false;
      return;
    }

    this.scores.push(...scores);
    scores.forEach(score => {
      let child = this.groups.find(group => group.children.some(child => child.id == score.childId)).children.find(child => child.id == score.childId);
      let mark = child.marks.find(mark => mark.customField.id == score.customFieldId);
      mark.value += score.value;
      child.sumOfMarks += score.value;
    });
    this.onAnyChange();
  }

  onCustomFieldSave(customField) {
    this.isCustomFiledModalOpen = false;
    if (!customField)
      return;

    customField.id = this.utils.findNewIdForCustomFields(this.customFields);
    this.customFields.push(customField);
    this.onAnyChange();
  }

  clearScores(group) {
    this.confirmationDialogService.confirm('Confirmare', 'Esti sigur ca vrei sa stergi punctajele?').then((confirmed) => {
      if (confirmed) {
        //clear scores
        for (let i = 0; i < this.scores.length; i++)
              if (group.children.some(child => child.id == this.scores[i].childId))
                this.scores.splice(i--, 1);

        // clear scores mapped to children
        let children = group.children.map(child => {
          let marks = child.marks.map(mark => <any>{ value: 0, customField: mark.customField });
          marks.forEach(mark => this.scores.push(<Score>{ value: 0, childId: child.id, customFieldId: mark.customField.id}))
          child.sumOfMarks = 0;
          child.marks = marks;
          return child;
        });

        group.children = children;
        this.toastService.add({ severity: 'success', summary: 'Info', detail: 'Punctajele au fost sterse cu succes' });
      }
    });

    this.onAnyChange();
  }

  exportCSV(group: Group) {
    let header = ['Nume'].concat(group.customFields.map(customField => customField.name)).concat(['Total']);
    let data = group.children.map(child => [child.name].concat(...child.marks.map(mark => mark.value).concat([child.sumOfMarks])));
    let csv = data.map(row => row.join('","')).map(row => `"${row}"`);
    csv.unshift(header.join(','));
    let blob = new Blob([csv.join('\r\n')], { type: 'text/csv' });
    saveAs(blob, `Copii ${group.name}.csv`);
  }

  onAnyChange() {
    this.onGroupsChanges.emit();
  }
}




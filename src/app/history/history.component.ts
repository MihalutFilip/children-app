import { Component, OnInit, ViewChild, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material';
import { Lesson } from '../domains/Lesson';
import { ConfirmationDialogService } from '../modals/confirmation-dialog/confirmation-dialog.service';
import { MessageService } from 'primeng/api';
import { Group } from '../domains/Group';
import { saveAs } from 'file-saver';
import { Score } from '../domains/Score';
import { Utils } from '../utils/utils';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  providers: [MessageService]
})

export class HistoryComponent implements OnInit {
  @Input() lessons: Lesson[];
  @Input() groups: Group[];
  @Input() scores: Score[];
  @Output() onLessonsChanges: EventEmitter<any> = new EventEmitter();
  displayedColumns: string[] = ['date', 'text', 'set', 'verse', 'centralTruth', 'missionayLesson', 'pray', 'edit', 'delete'];
  selectedGroup: Group;
  tableOfLessons: MatTableDataSource<Lesson>;
  selectedGroups: string[];
  isModalOpen: Boolean = false;
  currentLesson: Lesson;
  utils = new Utils();

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private confirmationDialogService: ConfirmationDialogService, private toastService: MessageService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lessons'])
      this.lessons = changes['lessons'].currentValue;
    if (changes['groups'])
      this.groups = changes['groups'].currentValue;
  }

  ngOnInit() {
    this.updateTable(this.lessons);
  }

  openSaveModal() {
    this.currentLesson = new Lesson();
    this.isModalOpen = true;
  }

  updateTable(list) {
    this.tableOfLessons = new MatTableDataSource<Lesson>(list.sort((a: Lesson, b: Lesson) => {
      return b.date.getTime() - a.date.getTime();
    }));
    setTimeout(() => this.tableOfLessons.paginator = this.paginator);
    this.onLessonsChanges.emit();
  }

  openConfirmationModal(lesson) {
    this.confirmationDialogService.confirm('Confirmare', 'Esti sigur ca vrei sa stergi lectia?').then((confirmed) => {
      if (confirmed) {
        // delete scores for this lesson
        for (let i = 0; i < this.scores.length; i++)
          if (this.scores[i].lessonId === lesson.id)
            this.scores.splice(i--, 1);

        this.lessons.splice(this.lessons.indexOf(lesson), 1);
        this.selectedGroup.lessons.splice(this.selectedGroup.lessons.indexOf(lesson), 1);
        this.updateTable(this.selectedGroup.lessons);
        this.toastService.add({ severity: 'success', summary: 'Info', detail: 'Lectia a fost stearsa cu succes' });
      }
    });
  }

  openEditModal(lesson) {
    this.currentLesson = { ...lesson };
    this.isModalOpen = true;
  }

  onSave(lesson) {
    this.isModalOpen = false;

    if (!lesson)
      return;

    if (lesson.id) {
      var lessonIndex = this.lessons.findIndex(l => l.id == lesson.id);
      this.lessons[lessonIndex] = { ...lesson };
      var lessonIndex = this.selectedGroup.lessons.findIndex(l => l.id == lesson.id);
      this.selectedGroup.lessons[lessonIndex] = { ...lesson };
    }
    else {
      lesson.id = this.utils.findNewIdForLesson(this.lessons);
      lesson.groupId = this.selectedGroup.id;
      this.lessons.push(lesson);
      this.selectedGroup.lessons.push(lesson);
    }

    this.updateTable(this.selectedGroup.lessons);
  }

  formatDate(date) {
    var monthNames = [
      "Ianuarie", "Februarie", "Martie",
      "Aprilie", "Mai", "Iunie", "Iulie",
      "August", "Septembrie", "Octombrie",
      "Novembrie", "Decembrie"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }

  get selectedGroupName() {
    return this.selectedGroup ? this.selectedGroup.name : undefined;
  }

  onChangeGroup(group) {
    this.selectedGroup = group;
    this.updateTable(group.lessons);
  }

  exportCSV() {
    let header = ['Data', 'Lectia', 'Setul', 'Verset', 'Adevar central', 'Lectie mistionara', 'Rugaciune'];
    let data = this.selectedGroup.lessons.map(lesson => [this.formatDate(lesson.date), lesson.text, lesson.set, lesson.verse, lesson.centralTruth, lesson.missionaryLesson, lesson.pray]);
    let csv = data.map(row => row.join('","')).map(row => `"${row}"`);
    csv.unshift(header.join(','));
    let blob = new Blob([csv.join('\r\n')], { type: 'text/csv' });
    saveAs(blob, `Lectii ${this.selectedGroup.name}.csv`);
  }
}
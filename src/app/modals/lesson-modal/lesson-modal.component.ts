import { Component, OnInit, ViewChild, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Lesson } from 'src/app/domains/Lesson';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-lesson-modal',
  templateUrl: './lesson-modal.component.html',
  styleUrls: ['./lesson-modal.component.scss']
})
export class LessonModalComponent implements OnInit {
  @ViewChild('content', { static: false }) content: HTMLElement;
  @ViewChild('inputName', { static: true }) inputName: HTMLElement;
  @ViewChild('picker', { static: false }) picker: HTMLElement;
  @Input() isModalOpen: boolean = false;
  @Input() lesson: Lesson = new Lesson();
  @Output() onCloseModal: EventEmitter<Lesson> = new EventEmitter();
  date: Date;
  title: string = 'Adăugare lecție';
  modal: any;
  error: string;

  constructor(private modalService: NgbModal, private toastService: MessageService) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };

    if (changes['isModalOpen'])
      this.isModalOpen = changes['isModalOpen'].currentValue;
    if (changes['lesson']) {
      this.lesson = changes['lesson'].currentValue;

      if (this.isModalOpen) {
        if (!this.lesson.id) {
          this.title = 'Adăugare lecție';
          this.lesson.date = new Date();
        }
        else
          this.title = 'Editare lecție';

        this.modal = this.modalService.open(this.content, ngbModalOptions);

        // set focus on input
        setTimeout(() => {
          document.getElementById("inputName").focus();
        }, 0);
      }
    }
  }

  onClose() {
    this.isModalOpen = false;
    this.onCloseModal.emit(null);
  }

  validateLesson() {
    this.error = "";

    if (!this.lesson.text) {
      this.error += "Numele nu e completat";
      return;
    }

    if (!this.lesson.set) {
      this.error += "Setul nu e completat";
      return;
    }

    if (!this.lesson.verse) {
      this.error += "Versetul nu e completat";
      return;
    }

    if (!this.lesson.centralTruth) {
      this.error += "Adevărul central nu e completat";
      return;
    }

    if (!this.lesson.missionaryLesson) {
      this.error += "Lecția misionară nu e completată";
      return;
    }

    if (!this.lesson.pray) {
      this.error += "Rugăciunea nu e completată";
      return;
    }
  }

  onSave() {
    this.validateLesson();
    if (this.error.length != 0) {
      this.toastService.add({ severity: 'error', summary: 'Eroare', detail: this.error });
      return;
    }

    this.isModalOpen = false;
    this.onCloseModal.emit(this.lesson);
    this.modal.dismiss('Cross click');
  }
}

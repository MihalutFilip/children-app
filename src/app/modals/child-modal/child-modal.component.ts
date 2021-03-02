import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges, ElementRef } from '@angular/core';
import { Child } from 'src/app/domains/Child';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-child-modal',
  templateUrl: './child-modal.component.html',
  styleUrls: ['./child-modal.component.scss']
})
export class ChildModalComponent implements OnInit {
  @ViewChild('content', { static: false }) content: HTMLElement;
  @ViewChild('inputName', { static: true }) inputName: HTMLElement;
  @Input() isModalOpen: boolean;
  @Input() child: Child;
  @Output() onCloseModal: EventEmitter<Child> = new EventEmitter();
  title: string = 'Adăugare copil';
  modal: any;

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
    if (changes['child']) {
      this.child = changes['child'].currentValue;
      if (this.isModalOpen) {

        if (!this.child.id)
          this.title = 'Adăugare copil';
        else
          this.title = 'Editare copil';
        this.modal = this.modalService.open(this.content, ngbModalOptions);

        // set focus on input
        setTimeout(() => {
          document.getElementById("inputName").focus();
        },0);
      }
    }
  }

  onClose() {
    this.isModalOpen = false;
    this.onCloseModal.emit(null);
  }

  onSave() {
    if(!this.child.name) {
      this.toastService.add({ severity: 'error', summary: 'Eroare', detail: 'Numele nu e completat' });
      return;
    }

    this.isModalOpen = false;
    this.onCloseModal.emit(this.child);
    this.modal.dismiss('Cross click')
  }
}

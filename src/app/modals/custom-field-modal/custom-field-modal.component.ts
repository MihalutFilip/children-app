import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CustomField } from 'src/app/domains/CustomField';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-custom-field-modal',
  templateUrl: './custom-field-modal.component.html',
  styleUrls: ['./custom-field-modal.component.scss']
})
export class CustomFieldModalComponent implements OnInit {
  @ViewChild('content',{static: false}) content : HTMLElement;
  @ViewChild('inputName', { static: true }) inputName: HTMLElement;
  @Input() isModalOpen: boolean;
  @Output() onCloseModal: EventEmitter<CustomField> = new EventEmitter();
  customField: CustomField;
  title: string = 'Adăugare metodă de punctare';
  modal: any;

  constructor(private modalService: NgbModal, private toastService: MessageService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop : 'static',
      keyboard : false
    };
    
    if(changes['isModalOpen'])
      this.isModalOpen = changes['isModalOpen'].currentValue;
    if(this.isModalOpen) {
      this.modal = this.modalService.open(this.content, ngbModalOptions);

      // set focus on input
      setTimeout(() => {
        document.getElementById("inputName").focus();
      },0);
    }
    this.customField = new CustomField();
  }

  onClose() {
    this.isModalOpen = false; 
    this.onCloseModal.emit(null);
  }

  onSave() {
    if(!this.customField.name) {
      this.toastService.add({ severity: 'error', summary: 'Eroare', detail: 'Numele nu e completat' });
      return;
    }

    this.isModalOpen = false; 
    this.onCloseModal.emit(this.customField);
    this.modal.dismiss('Cross click');
  }

}

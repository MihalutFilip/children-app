import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Group } from 'src/app/domains/Group';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CustomField } from 'src/app/domains/CustomField';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-group-modal',
  templateUrl: './group-modal.component.html',
  styleUrls: ['./group-modal.component.scss']
})
export class GroupModalComponent implements OnInit {
  @ViewChild('content',{static: false}) content : HTMLElement;
  @ViewChild('picker',{static: false}) picker : HTMLElement;
  @Input() isModalOpen: boolean;
  @Input() customFields: CustomField[];
  @Input() group: Group;
  @Output() onCloseModal: EventEmitter<Group> = new EventEmitter();
  title: string = 'Adăugare grupă';
  selectedItems = [];
  dropdownSettings = {};
  modal: any;

  constructor(private modalService: NgbModal, private toastService: MessageService) { }

  ngOnInit() {
    this.dropdownSettings = <IDropdownSettings> {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: false
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop : 'static',
      keyboard : false,
      windowClass: 'custom-class'
    };
    
    if(changes['isModalOpen'])
      this.isModalOpen = changes['isModalOpen'].currentValue;
      if(changes['group'])
      {
        this.group = changes['group'].currentValue;   
        if(this.isModalOpen)
        {
          if(!this.group.id)
            this.title = 'Adăugare grupă';
          else
            this.title = 'Editare grupă';
          this.modal = this.modalService.open(this.content, ngbModalOptions);
        }
          
      }
  }

  onClose() {
    this.isModalOpen = false; 
    this.onCloseModal.emit(null);
  }

  onSave() {
    if(!this.group.name) {
      this.toastService.add({ severity: 'error', summary: 'Eroare', detail: 'Numele nu e completat' });
      return;
    }

    if(!this.group.customFields)
      this.group.customFields = [];
    
    if(!this.group.lessons)
      this.group.lessons = [];
    
    if(!this.group.children)
      this.group.children = [];
    
    this.isModalOpen = false; 
    this.onCloseModal.emit(this.group);
    this.modal.dismiss('Cross click');
  }

}

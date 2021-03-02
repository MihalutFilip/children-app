import { Child } from './Child';
import { Lesson } from './Lesson';
import { CustomField } from './CustomField';

export class Group {
    id: number;
    name: string;
    customFields: CustomField[];
    children: Child[];
    lessons: Lesson[];
    isExpanded: boolean;
}
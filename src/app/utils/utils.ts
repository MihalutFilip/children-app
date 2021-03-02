import { CustomField } from '../domains/CustomField';
import { Group } from '../domains/Group';
import { Child } from '../domains/Child';
import { Lesson } from '../domains/Lesson';
import { Score } from '../domains/Score';

export class Utils {
    findNewIdForGroup(groups: Group[]) {
        return groups.length == 0 ? 1 : Math.max(...groups.map(group => group.id)) + 1;
    }

    findNewIdForChild(groups: Group[]) {
        let children = [].concat(...groups.map(group => group.children));
        return children.length == 0 ? 1 : Math.max(...children.map(child => child.id)) + 1;
    }

    findNewIdForLesson(lessons: Lesson[]) {
        return lessons.length == 0 ? 1 : Math.max(...lessons.map(lesson => lesson.id)) + 1;
    }

    findNewIdForCustomFields(customFields: CustomField[]) {
        return customFields.length == 0 ? 1 : Math.max(...customFields.map(customField => customField.id)) + 1;
    }

    getSumOfMarks(marks: any) {
        return marks.map(mark => mark.value).reduce((a,b) => a + b,0);
    }

    randomColor(id: number){
        let colors = ['#03396c','#fe4a49', '#2ab7ca', '#651e3e', '#fed766', '#851e3e', '#4a4e4d', '#f4b6c2','#363636', '#0e9aa7', '#3da4ab', '#f6cd61', 
        '#fe8a71', '#ee4035', '#f37736', '#7bc043', '#0392cf', '#854442', '#be9b7b', '#008744', '#0057e7','#FC913A',' #45ADA8','#594F4F', '#F7DB4F'];
        return colors[id % colors.length - 1];
    }

    getCustomFields(data) {
        return data.split('--')
            .map(x => {
                let fields = x.split(';');
                return <CustomField> {
                    id: parseInt(fields[0]),
                    name: fields[1]
                }                
            }).filter(x => x.id);
    }

    getGroups(data) {
        return data.split('--')
            .map(x => {
                let fields = x.split(';');
                return <Group> {
                    id: parseInt(fields[0]),
                    name: fields[1],
                    customFields: [],
                    children: [],
                    lessons: []
                }        
            }).filter(x => x.id);
    }

    getChildren(data) {
        return data.split('--')
            .map(x => {
                let fields = x.split(';');
                return <Child> {
                    id: parseInt(fields[0]),
                    groupId: parseInt(fields[1]),
                    name: fields[2],
                    iconColor: this.randomColor(parseInt(fields[0])),
                    marks: []
                }        
            }).filter(x => x.id);
    }

    getLessons(data) {
        return data.split('--')
            .map(x => {
                let fields = x.split(';');
                return <Lesson> {
                    id: parseInt(fields[0]),
                    groupId: parseInt(fields[1]),
                    date: new Date(fields[2]),
                    text: fields[3],
                    set: fields[4],
                    verse: fields[5],
                    centralTruth: fields[6],
                    missionaryLesson: fields[7],
                    pray: fields[8]
                }        
            }).filter(x => x.id);
    }

    getScores(data) {
        return data.split('--')
            .map(x => {
                let fields = x.split(';');
                return <Score> {
                    childId: parseInt(fields[0]),
                    customFieldId: parseInt(fields[1]),
                    lessonId: parseInt(fields[2]),
                    value: parseInt(fields[3])
                }        
            }).filter(x => x.childId);
    }


    convertStringToObjects(data) {
        let tables = data.split('<>');
        let customFields = this.getCustomFields(tables[0]);
        let groups = this.getGroups(tables[1]);
        let children = this.getChildren(tables[2]);
        let lessons = this.getLessons(tables[3]);
        let scores = this.getScores(tables[4]);    

        //values on relationship between tables
        children.forEach(child => groups.find(group => group.id == child.groupId).children.push(child));
        lessons.forEach(lesson => groups.find(group => group.id == lesson.groupId).lessons.push(lesson));
        scores.forEach(score => {
            let marks = children.find(child => child.id == score.childId).marks;
            let mark = marks.find(mark => mark.customField.id == score.customFieldId);
            if(mark)
                mark.value += score.value;
            else marks.push({value: score.value, customField: customFields.find(x => x.id == score.customFieldId)})
        });
       
        children.forEach(child => child.sumOfMarks = this.getSumOfMarks(child.marks));
        groups.forEach(group => {
            let marks = [...group.children.map(child => child.marks)];
            let customFields = [].concat(...marks.map(mark => mark.map(i => i.customField)));
            let uniqueCustomFields = Array.from(new Set(customFields));
            group.customFields = uniqueCustomFields;
        });
        
        return {
            customFields: customFields,
            groups: groups,
            children: children,
            lessons: lessons,
            scores: scores
        };
    }

    customFieldsToString(customFields) {
        return customFields.reduce((finalString, customField) => finalString + customField.id + ';' + customField.name + '--', '');
    }

    groupsToString(groups) {
        return groups.reduce((finalString, group) => finalString + group.id + ';' + group.name + '--', '');
    }

    childrenToString(children) {
        return children.reduce((finalString, child) => finalString + child.id + ';' + child.groupId + ';' + child.name + '--', '');
    }

    getDate(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        return month + '-' + day + '-' + year;
    }

    lessonsToString(lessons: Lesson[]) {       
        return lessons.reduce((finalString, lesson) => finalString + lesson.id + ';' + lesson.groupId + ';' + this.getDate(lesson.date) + ';' + 
                                                        lesson.text + ';' + lesson.set + ';' + lesson.verse + ';' + lesson.centralTruth + ';' +
                                                        lesson.missionaryLesson + ';' + lesson.pray + '--', '');
    }

    scoresToString(scores: Score[]) {
        return scores.reduce((finalString, score) => finalString + score.childId + ';' + score.customFieldId+ ';' + (score.lessonId || 0) + ';' + score.value + '--', '');
    }

    convertObjectsToString(tables) {
        return this.customFieldsToString(tables.customFields) + '<>' + this.groupsToString(tables.groups) + '<>' + this.childrenToString(tables.children)
                + '<>' + this.lessonsToString(tables.lessons) + '<>' + this.scoresToString(tables.scores);
    }
}
import { Component, OnInit, Input } from '@angular/core';
import { Child } from '../domains/Child';
import { Group } from '../domains/Group';
import { Score } from '../domains/Score';
import { Lesson } from '../domains/Lesson';
import { CustomField } from '../domains/CustomField';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  @Input() groups: Group[];
  @Input() scores: Score[];
  @Input() children: Child[];
  options: any;
  selectedReport: any;
  reportTypes = [];
  selectedGroup: Group;
  selectedChild: Child;
  selectedYear: any;

  years = [];
  constructor() { }

  ngOnInit() {
    this.reportTypes = [{ name: 'Punctaje copii' }, { name: 'Productivitate lecții' }, { name: 'Metode de punctare' }, { name: 'Evoluția unui copil' }];
    this.selectedReport = this.reportTypes[0];
    this.fillYears();
    if (this.groups.length > 0) {
      this.renderRankingChildrenChart(this.groups[0]);
      this.selectedGroup = this.groups[0];
      this.selectedChild = this.children[0];
    }
  }

  fillYears() {
    let currentDate = new Date();
    this.years = Array(currentDate.getFullYear() - 2009).fill(0).map((_, i) => {
      return {
        value: 2020 - i
      }
    })
    this.selectedYear = this.years[0];
  }

  onChange() {
    switch (this.reportTypes.indexOf(this.selectedReport)) {
      case 0:
        this.renderRankingChildrenChart(this.selectedGroup);
        break;
      case 1:
        this.renderRankingLessonsChart(this.selectedGroup);
        break;
      case 2:
        this.renderCustomFieldsChart(this.selectedGroup);
        break;
      case 3:
        this.renderProgressOfAChildChart(this.groups.find(group => group.children.some(child => child.id == this.selectedChild.id)), this.selectedChild);
        break;
    }
  }

  get customFieldSelected() {
    return this.reportTypes.indexOf(this.selectedReport) == 2;
  }

  get evolutionOfAChildSelected() {
    return this.reportTypes.indexOf(this.selectedReport) == 3;
  }

  renderRankingChildrenChart(group) {
    let sortedChildren = group.children.sort((firstChild, secondChild) => firstChild.sumOfMarks > secondChild.sumOfMarks ? -1 : 1);
    let childrenSeries = group.customFields.map(customField => {
      return {
        name: customField.name,
        data: sortedChildren.map(child => child.marks.find(mark => mark.customField.id == customField.id).value)
      }
    });

    let childrenCategories = sortedChildren.map(child => child.name);
    this.options = {
      series: childrenSeries,
      chart: {
        type: "bar",
        height: group.children.length <= 10 ? 600 : 600 + (group.children.length - 10)*40,
        stacked: true
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },
      stroke: {
        width: 1,
        colors: ["#fff"]
      },
      xaxis: {
        categories: childrenCategories,
      },
      yaxis: {
        title: {
          text: undefined
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " puncte";
          }
        }
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: "top",
        horizontalAlign: "center",
        offsetX: 40
      }
    };
  }

  renderRankingLessonsChart(group: Group) {
    let sortedLessons = group.lessons.map(lesson => {
      return {
        id: lesson.id,
        name: lesson.text,
        value: this.scores.filter(score => score.lessonId == lesson.id).map(score => score.value).reduce((a, b) => a + b, 0)
      }
    }).sort((a, b) => a.value > b.value ? -1 : 1);
    let lessonSeries = group.customFields.map(customField => {
      return {
        name: customField.name,
        data: sortedLessons.map(lesson => this.scores.filter(score => score.lessonId == lesson.id && score.customFieldId == customField.id).reduce((a, b) => a + b.value, 0))
      }
    });
    let lessonCategories = sortedLessons.map(lesson => lesson.name);
    this.options = {
      series: lessonSeries,
      chart: {
        type: "bar",
        height: group.lessons.length <= 10 ? 600 : 600 + (group.lessons.length - 10)*40,
        stacked: true
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },
      stroke: {
        width: 1,
        colors: ["#fff"]
      },
      xaxis: {
        categories: lessonCategories,
      },
      yaxis: {
        title: {
          text: undefined
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " puncte";
          }
        }
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: "top",
        horizontalAlign: "center",
        offsetX: 40
      }
    };
  }

  getValuesInEveryMounth(customField, group) {
    return Array(12).fill(0).map((_, i) => {
      let startDate = new Date(this.selectedYear.value, i, 0);
      let endDate = new Date(this.selectedYear.value, i + 1, 0);
      let scores = this.scores.filter(score => score.customFieldId == customField.id && group.children.some(child => child.id == score.childId));
      let scoresInTheSelectedTime = scores.filter(score => {
        let lesson = group.lessons.find(lesson => lesson.id == score.lessonId);
        return lesson ? lesson.date.getTime() >= startDate.getTime() && lesson.date.getTime() <= endDate.getTime() : false;
      });
      return scoresInTheSelectedTime.reduce((a, b) => a + b.value, 0);
    })
  }

  renderCustomFieldsChart(group: Group) {
    let customFieldSeries = group.customFields.map(customField => {
      return {
        name: customField.name,
        data: this.getValuesInEveryMounth(customField, group)
      }
    });

    this.options = {
      series: customFieldSeries,
      chart: {
        type: "bar",
        height: 400
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: [
          "Ianuarie",
          "Februarie",
          "Martie",
          "Aprilie",
          "Mai",
          "Iunie",
          "Iulie",
          "August",
          "Septembrie",
          "Octombrie",
          "Noiembrie",
          "Decembrie"
        ]
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " puncte";
          }
        }
      }
    };
  }

  getDataForChildSelected(group: Group, child: Child, customField: CustomField, sortedLessons: Lesson[]) {
    return sortedLessons.map(lesson => this.scores.filter(score => score.childId == child.id && score.customFieldId == customField.id && score.lessonId == lesson.id)
      .reduce((a, b) => a + b.value, 0));
  }

  renderProgressOfAChildChart(group: Group, child: Child) {
    let sortedLessons = group.lessons.sort((a: Lesson, b: Lesson) => {
      return a.date.getTime() - b.date.getTime();
    });

    let childSeries = group.customFields.map(customField => {
      return {
        name: customField.name,
        data: this.getDataForChildSelected(group, child, customField, sortedLessons)
      }
    });

    // let childCategories = sortedLessons.map(lesson => {
    //   let lessonDates = lesson.date.toLocaleDateString().split('/')
    //   return lessonDates[1] + '/' + lessonDates[0] + '/' + lessonDates[2];
    // });
    let childCategories = sortedLessons.map(lesson => lesson.date.getDate() + '/' + (lesson.date.getMonth() + 1));

    this.options = {
      series: childSeries,
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        // type: "date",
        categories: childCategories
      },
      tooltip: {
        x: {
          formatter: function (val) {
            return sortedLessons[val - 1].text;
          }
        }
      }
    };
  }

}

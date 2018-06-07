import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ActionSheetController, Events } from 'ionic-angular';
import { Chart } from 'chart.js';
import * as pattern from 'patternomaly';
import { UserTransaction } from "../../models/userTransaction";
import { UserAccount } from "../../models/userAccount";
import { PlaidService } from '../../providers/plaid-service/plaid-service';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { UserMonthlyRecord } from "../../models/user-monthly-record";
/**
 * Generated class for the DetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-detail',
    templateUrl: 'detail.html',
})
export class DetailPage {
    private _chartVisible = true;
    private m = new Map();
    private chart: Chart = [];
    private chart2: Chart = [];
    private chartOptions = {
        type: `bar`,
        data: {
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    // pattern.draw('circle', '#36a2eb'),
                    // pattern.draw('diamond', '#cc65fe'),
                    // pattern.draw('triangle', '#ffce56'),
                ],
                borderColor: [
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                ],
                borderWidth: 1
            },
                {
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                    ],
                    borderColor: [
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                    ],
                    borderWidth: 1
                }],
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontSize: 10
                    }
                }],
            },
            onClick: (evt) => {
                var activePoints = this.chart.getElementsAtEvent(evt);

                if (activePoints.length > 0) {
                    // get the internal index of slice in pie chart
                    this.clickedElementindex = activePoints[0]["_index"];
                    //this.gotoSummaryDetail(clickedElementindex);
                    //this.generateNewTransactions(clickedElementindex);
                }
            },
            maintainAspectRatio: false,
            responsive: true
        }


    };
    private chartOptions2 = {
        type: `bar`,
        data: {
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    // pattern.draw('diamond', '#cc65fe'),
                    // pattern.draw('triangle', '#ffce56'),
                ],
                borderColor: [
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                    'rgba(255, 151, 99,1)',
                ],
                borderWidth: 1
            },
                {
                    data: [0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                        'rgba(17, 178, 69, 0.2)',
                    ],
                    borderColor: [
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                        'rgba(17, 178, 69,1)',
                    ],
                    borderWidth: 1
                }],
            labels: ['Food and Drink', 'Restaurants', 'Coffee Shop', 'Chase QuickPay', 'Shops', 'Service', 'Transfer', 'Other']
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontSize: 7
                    }
                }],
            },
            onClick: (evt) => {
                var activePoints = this.chart2.getElementsAtEvent(evt);

                if (activePoints.length > 0) {
                    // get the internal index of slice in pie chart
                    var clickedElementindex = activePoints[0]["_index"];
                    this.gotoSummaryDetail2(clickedElementindex);
                    //this.generateNewTransactions(clickedElementindex);
                }
            },
            maintainAspectRatio: false,
            responsive: true
        }
    };
    constructor(
        private zone: NgZone,
        public navCtrl: NavController,
        public navParams: NavParams,
        private plaidService: PlaidService,
        private events: Events,) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DetailPage');
        this.events.publish(`app:pageLoaded`);
        this.m.set('Food and Drink', 0);
        this.m.set('Restaurants', 1);
        this.m.set('Coffee Shop', 2);
        this.m.set('Chase QuickPay', 3);
        this.m.set('Shops', 4);
        this.m.set('Service', 5);
        this.m.set('Transfer', 6);
        console.log("wen test 11");
        this.chart = new Chart(`chart-canvas`, this.chartOptions);
        //this.getData();
    }

    private _access_token: string = this.navParams.get("accessToken");
    private _userId: string = this.navParams.get("userId");
    private month = new Date().getMonth();
    private year = new Date().getFullYear();
    private _transactions: any = [];
    private from;
    private to;
    private clickedElementindex = new Date().getDay();

    getData() {
        for(var z3 = 0; z3 <  this.chartOptions.data.datasets[0].data.length; z3++) {
            this.chartOptions.data.datasets[0].data[z3] = 0;
            this.chartOptions.data.datasets[1].data[z3] = 0;
        }
        let trans = {};
        this.from = new Date(this.year, this.month, 1);
        this.to = new Date(this.year, this.month + 1, 0);
        console.log(`wen test 105 ${this.year}       ${this.to}`);
        /*
        for(var z4 = 0; z4 <  this.chartOptions2.data.datasets[0].data.length; z4++) {
            this.chartOptions2.data.datasets[0].data[z4] = 0;
            this.chartOptions2.data.datasets[1].data[z4] = 0;
        }
        */

        this.plaidService.getTransactionsWithTimeRange(this._access_token, this.from, this.to).then(res => {
            res.forEach(t => {
                trans[t["transaction_id"]] = t;
                console.log("wen test 102");
            });
        }).then(() => {
            console.log(`wen test 106 ${Object.getOwnPropertyNames(trans).length}`);
            this.plaidService.getTransactionRecords(this._userId, this.from, this.to).then(r => {
                this._transactions.length = 0;
                let result = r.filter(t => t.flagged == true || t.flagged == null);
                console.log(r);
                console.log(`wen test 103 ${Object.getOwnPropertyNames(result).length}`);
                result.forEach(t => {
                        console.log("wen test 104");
                        let target = trans[t["transactionId"]];
                        console.log(`wen test 108 ${target}`);
                        if (target != null) {
                            console.log(`love the item? ${t["loved"]}`);
                            console.log(`wen test 107 ${target["date"]}`);
                            target["loved"] = t["loved"];
                            console.log("wen test 109");
                            var day = new Date(target["date"]).getDay();
                            console.log("wen test 110");
                            if(target["loved"] == true) {
                                this.chartOptions.data.datasets[1].data[day] += target["amount"];
                                //console.log(`wen test 101 ${day} ${target["amount"]} ${this.chartOptions.data.datasets[1].data[day]}`);
                            }
                            else{
                                this.chartOptions.data.datasets[0].data[day] += target["amount"];
                                //console.log(`wen test 101 ${day} ${target["amount"]} ${this.chartOptions.data.datasets[0].data[day]}`);

                            }
                            if(this.clickedElementindex == day) {
                                this._transactions.push(target);
                                console.log(`wen test 116 ${this.clickedElementindex} ${day}`);
                            }
                        }
                        for(var z3 = 0; z3 <  this.chartOptions.data.datasets[0].data.length; z3++) {
                            console.log(`wen test 114 ${this.chartOptions.data.datasets[0].data[z3]} ${this.chartOptions.data.datasets[1].data[z3]}`);
                        }
                });
                
            });
        }).then( () => {
            for(var z3 = 0; z3 <  this.chartOptions.data.datasets[0].data.length; z3++) {
                console.log(`wen test 113 ${this.chartOptions.data.datasets[0].data[z3]} ${this.chartOptions.data.datasets[1].data[z3]}`);
            }
            console.log(`wen test 115 ${this._transactions.length}`);
            this.roundAll();
            this.chart = new Chart(`chart-canvas`, this.chartOptions);
            this.chart.update();
        });


    /*
        this.plaidService.getTransactionsWithTimeRange(this._access_token, this.from, this.to).then(res => {
            res.forEach(t => {
                trans[t["transaction_id"]] = t;
            });
        }).then(() => {
            this.plaidService.getTransactionRecords(this._userId, this.from, this.to).then(r => {
                this._transactions.length = 0;
                let result = r.filter(t => t.flagged == true || t.flagged == null);
                console.log(r);
                result.forEach(t => {
                    let target = trans[t["transactionId"]];
                    if (target != null) {
                        target["loved"] = t["loved"];
                        this._transactions.push(target);
                    }
                });
            });
        }).then( () => {
            console.log(`wen test ${this._transactions.length}`);
            this._transactions.forEach( t => {
                    var date = new Date(t["date"]);
                    var day = date.getDay();
                    console.log(`wen test love the item? ${t["loved"]}`);
                    if(t["loved"] == true) {
                        this.chartOptions.data.datasets[1].data[day] += t["amount"];
                        for(var j = 0; j < t["category"].length; j++) {
                            var temp = 7;
                            if(this.m.has(t["category"][j]))
                                temp = this.m.get(t["category"][j]);
                            this.chartOptions2.data.datasets[1].data[temp] += t["amount"];
                        }
                    }
                    else{
                        this.chartOptions.data.datasets[0].data[day] += t["amount"];
                        for(var j2 = 0; j2 < t["category"].length; j2++) {
                            var temp2 = 7;
                            if(this.m.has(t["category"][j2]))
                                temp2 = this.m.get(t["category"][j2]);
                            this.chartOptions2.data.datasets[0].data[temp2] += t["amount"];
                        }
                    }
                }
            );
        }).then(() => {
            this.zone.run( () => {
                    this.roundAll();
                    this.chart = new Chart(`chart-canvas`, this.chartOptions);
                    this.chart2 = new Chart(`chart-canvas2`, this.chartOptions2);
                }
            );
        });
        */


    }

    private _transactions2: any = [];
    gotoSummaryDetail(clickedElementindex) {
        let trans = {};
        this.plaidService.getTransactionsWithTimeRange(this._access_token, this.from, this.to).then(res => {
            res.forEach(t => {
                trans[t["transaction_id"]] = t;
            });
        }).then(() => {
            this.plaidService.getTransactionRecords(this._userId, this.from, this.to).then(r => {
                this._transactions2.length = 0;
                let result = r.filter(t => t.flagged == true || t.flagged == null);
                console.log(r);
                result.forEach(t => {
                    let target = trans[t["transactionId"]];
                    if (target != null && t["date"].getDay() == clickedElementindex) {
                        target["loved"] = t["loved"];
                        this._transactions2.push(target);
                    }
                });
            });
        }).then( () => {
                console.log(`wen test 17 ${this._transactions2.length}`);
            }
        );
    }

    gotoSummaryDetail2(clickedElementindex) {
        let trans = {};
        this.plaidService.getTransactionsWithTimeRange(this._access_token, this.from, this.to).then(res => {
            res.forEach(t => {
                trans[t["transaction_id"]] = t;
            });
        }).then(() => {
            this.plaidService.getTransactionRecords(this._userId, this.from, this.to).then(r => {
                this._transactions2.length = 0;
                let result = r.filter(t => t.flagged == true || t.flagged == null);
                console.log(r);
                result.forEach(t => {
                    let target = trans[t["transactionId"]];
                    if (target != null) {
                        for(var j2 = 0; j2 < t["category"].length; j2++) {
                            if((clickedElementindex == 7 && !this.m.has(t["category"][j2])) || (clickedElementindex < 7 && this.m.has(t["category"][j2]))) {
                                target["loved"] = t["loved"];
                                this._transactions2.push(target);
                            }
                        }
                    }
                });
            });
        }).then( () => {
                console.log(`wen test 18 ${this._transactions2.length}`);
            }
        );
    }
    private display = false;
    hide() {
        this.display = false;
    }

    round(x) {
        return Math.round(x * 100.0) / 100;
    }

    roundAll() {
        for(var z3 = 0; z3 <  this.chartOptions.data.datasets[0].data.length; z3++) {
            this.chartOptions.data.datasets[0].data[z3] = this.round(this.chartOptions.data.datasets[0].data[z3]);
            this.chartOptions.data.datasets[1].data[z3] = this.round(this.chartOptions.data.datasets[1].data[z3]);
        }
        /*
        for(var z4 = 0; z4 <  this.chartOptions2.data.datasets[0].data.length; z4++) {
            this.chartOptions2.data.datasets[0].data[z4] = this.round(this.chartOptions2.data.datasets[0].data[z4]);
            this.chartOptions2.data.datasets[1].data[z4] = this.round(this.chartOptions2.data.datasets[1].data[z4]);
        }
        */

    }
}

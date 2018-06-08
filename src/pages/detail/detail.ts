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
                    var clickedElementindex = activePoints[0]["_index"];
                    this.clearData();
                    this.getData(clickedElementindex);
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
        this.getData(new Date().getDay());
    }

    private _access_token: string = this.navParams.get("accessToken");
    private _userId: string = this.navParams.get("userId");
    private month = new Date().getMonth();
    private year = new Date().getFullYear();
    private _transactions: any = [];
    private from;
    private to;
    clearData() {
        for(var z3 = 0; z3 <  this.chartOptions.data.datasets[0].data.length; z3++) {
            this.chartOptions.data.datasets[0].data[z3] = 0;
            this.chartOptions.data.datasets[1].data[z3] = 0;
            console.log(`wen test 133 ${this.chartOptions.data.datasets[0].data[z3]}`);
        }
        this._transactions = [];
    }

    getData(clickedElementindex) {
        let trans = {};
        this.from = new Date(this.year, this.month, 1);
        this.to = new Date(this.year, this.month + 1, 0);
        console.log(`wen test 1: this.to: ${this.to} this.year: ${this.year} this.month: ${this.month}`);
        var i = 0;
        this.plaidService.getTransactionsWithTimeRange(this._access_token, this.from, this.to).then(res => {
            res.forEach(t => {
                trans[t["transaction_id"]] = t;
            });
            i++;
            this.clearData();
            this.plaidService.getTransactionRecords(this._userId, this.from, this.to).then(r => {
                i++;
                this._transactions.length = 0;
                let result = r.filter(t => t.flagged == true || t.flagged == null);
                this.clearData();
                result.forEach(t => {
                        let target = trans[t["transactionId"]];
                        console.log(`wen test 4: ${i}`);
                        i++;
                        if (target != null) {
                            target["loved"] = t["loved"];
                            var day = new Date(target["date"]).getDay();
                            if(target["loved"] == true) {
                                this.chartOptions.data.datasets[1].data[day] += target["amount"];
                            }
                            else{
                                this.chartOptions.data.datasets[0].data[day] += target["amount"];

                            }
                            if(clickedElementindex == day) {
                                this._transactions.push(target);
                            }
                        }
                });
                this.roundAll();
                this.chart = new Chart(`chart-canvas`, this.chartOptions);
                this.chart.update();

            })
        });

    }


    getData2() {
        var clickedElementindex = new Date().getDay();
        this.clearData();
        this.getData(clickedElementindex);
    }


    round(x) {
        return Math.round(x * 100.0) / 100;
    }

    roundAll() {
        for(var z3 = 0; z3 <  this.chartOptions.data.datasets[0].data.length; z3++) {
            this.chartOptions.data.datasets[0].data[z3] = this.round(this.chartOptions.data.datasets[0].data[z3]);
            this.chartOptions.data.datasets[1].data[z3] = this.round(this.chartOptions.data.datasets[1].data[z3]);
        }

    }
}

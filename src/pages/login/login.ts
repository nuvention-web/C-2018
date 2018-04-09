import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { UserSign } from '../../models/userSign';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private user = {} as UserSign;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth) {

    if (this.navParams.get(`from_sign_up`)) {
      this.signInWithData(
        this.navParams.get(`email`),
        this.navParams.get(`password`)
      );
    }
    else {
      this.afAuth.auth.onAuthStateChanged(user => {
        if (user) {
          // user logged in
          console.log("logged in");
          this.navCtrl.setRoot(`DashboardPage`, { signed_in: true, linked_credential: false });
        } else {
          // user logged out
          console.log("logged out");
        }
      });
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  private async signInWithData(email, password) {
    try {
      const result = await this.afAuth.auth.signInWithEmailAndPassword(email, password);
      if (result) {
        this.navCtrl.setRoot(`DashboardPage`, { signed_in: true, linked_credential: false });
      }
    } catch (e) {
      console.error(e);
    }
  }

  private signIn() {
    this.signInWithData(this.user.email, this.user.password);
  }

  private goToSignUp() {
    this.navCtrl.push(`SignUpPage`);
  }

}

import { Component, ViewChild } from '@angular/core';
import { App, IonicPage, ActionSheetController, MenuController, Nav, Events } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { ISubscription } from "rxjs/Subscription";

import { User } from '../../models/user';
import { UserAccount } from '../../models/userAccount';
import { PlaidService } from '../../providers/plaid-service/plaid-service';

/**
 * Generated class for the AppFramePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-app-frame',
  templateUrl: 'app-frame.html',
})
export class AppFramePage {
  @ViewChild(`appNav`) appNav: Nav;

  private _isLoading = true;
  private _linkedCredential = false;
  private _signedIn = false;

  private _user: User;
  private userAccountCollections: AngularFirestoreCollection<UserAccount>;
  private userAccount: AngularFirestoreDocument<UserAccount>;

  private _uaSubscription: ISubscription;
  private _userAccount: UserAccount;
  private _userAccountId;

  public emptyTransactions = true;
  public titleText = `Coinscious`;

  constructor(
    private firestore: AngularFirestore,
    private app: App,
    private plaidService: PlaidService,
    private afAuth: AngularFireAuth,
    private actionSheetCtrl: ActionSheetController,
    private menuCtrl: MenuController,
    private events: Events
  ) {
    this.userAccountCollections = this.firestore.collection<UserAccount>('user-accounts');

    this.events.subscribe(`nav:go-to-sign-up`, data => this.goToSignUp(data));
    this.events.subscribe(`nav:go-to-login`, data => this.goToLogin(data));
    this.events.subscribe(`nav:go-to-inbox`, data => this.goToInbox(data));
    this.events.subscribe(`nav:go-to-archive`, data => this.goToArchive(data));
    this.events.subscribe(`nav:go-to-summary`, data => this.goToSummary(data));
    this.events.subscribe(`nav:go-to-link-account`, data => this.goToLinkAccount(data));
    this.events.subscribe(`nav:unbind-account`, () => this.unbindAccount());
    this.events.subscribe(`nav:sign-out`, () => this.signOut());

    this.events.subscribe(`user:linkStatusChanged`, () => this.checkCredentials());

    this.events.subscribe(`app:pageLoaded`, () => {
      console.log(`page loaded`);
      this._isLoading = false;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppFramePage');

    this.checkAuthState();
  }

  private checkAuthState() {
    this._isLoading = true;
    this._signedIn = false;

    let unsubscribe = this.afAuth.auth.onAuthStateChanged(user => {
      console.log(`check auth state changed`);
      if (user) {
        // user logged in
        console.log("logged in");

        this._linkedCredential = false;
        this._signedIn = true;
        this.checkCredentials();
      } else {
        // user logged out
        this._isLoading = false;
        console.log("logged out");
        this.goToLogin({});
      }
      // unsubscribe();
    });
  }

  private checkCredentials() {
    this._isLoading = true;
    let s = this.afAuth.authState.subscribe(data => {
      this._linkedCredential = false;
      this._user = new User(data);

      this.userAccountCollections.ref.where(`userId`, '==', this._user.uid).get().then(res => {
        if (!res.empty) {
          console.log(`found credential`);
          this._linkedCredential = true;
          this.getUserInfo(res.docs[0].id);
        } else {
          this._isLoading = false;
          this._linkedCredential = false;
          this.goToLinkAccount({ user: this._user });
        }
      }, err => {
        console.log(`error`);
        this._isLoading = false;
        this._linkedCredential = false;
        this.goToLinkAccount({ user: this._user });
      });

      s.unsubscribe();
    });
  }

  private getUserInfo(userId) {
    this.userAccount = this.firestore.doc<UserAccount>(`user-accounts/${userId}`);
    this._userAccountId = userId;

    this._uaSubscription = this.userAccount.valueChanges().subscribe(ua => {
      this._isLoading = false;
      this._userAccount = ua;
      this._uaSubscription.unsubscribe();

      this._isLoading = false;
      this.goToInbox(null);
    });
  }

  goToInbox(data) {
    console.log(`Go To Inbox!!`);
    this._isLoading = true;
    if (data == null) data = {};
    data.userAccount = this._userAccount;
    data.user = this._user;
    data.userAccountId = this._userAccountId;
    this.menuCtrl.close();
    this.appNav.setRoot(`DashboardPage`, data);
    this.titleText = `Inbox`;
  }

  goToSummary(data) {
    this._isLoading = true;
    this.menuCtrl.close();
    this.appNav.setRoot(`DetailPage`, data);
    this.titleText = `Summary`;
  }

  goToArchive(data) {
    this._isLoading = true;
    data = { userId: this._userAccount.userId, accessToken: this._userAccount.accessToken, userEmail: this._user.email };
    this.menuCtrl.close();
    this.appNav.setRoot(`TransDetailPage`, data);
    this.titleText = `Archive`;
  }

  goToSignUp(data) {
    this._isLoading = true;
    this.menuCtrl.close();
    this.appNav.setRoot(`SignUpPage`, data);
    this.titleText = `Sign Up`;
  }

  goToLogin(data) {
    this._isLoading = true;
    this.menuCtrl.close();
    this.appNav.setRoot(`LoginPage`, data);
    this.titleText = 'Login';
  }

  goToLinkAccount(data) {
    this._isLoading = true;
    this.menuCtrl.close();
    this.appNav.setRoot(`LinkAccountPage`, data);
    this.titleText = `Link Account`;
  }

  unbindAccount() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Unbind Account?',
      buttons: [
        {
          text: 'Unbind',
          role: 'unbind',
          handler: () => {
            // console.log('Destructive clicked');
            this._isLoading = true;
            this.userAccount.delete().then(() => {
              this.checkCredentials();
            });
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
      this._signedIn = false;
      // this.goToLogin(null);
    });
  }

  openMenu() {
    this.menuCtrl.open();
  }

}

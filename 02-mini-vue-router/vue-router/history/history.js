import { History } from "./base";

class BrowserHistory extends History {
  setupListener() {
    window.addEventListener("popState", () => {
      this.transitionTo(getHash()); 
    });
  }
}

export default BrowserHistory;

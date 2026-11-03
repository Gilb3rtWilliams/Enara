import { useTitle } from "../lib/useTitle";

export function Privacy() {
  useTitle("Privacy · Enara");
  return (
    <article className="prose-page container">
      <p className="eyebrow">Privacy</p>
      <h1>Your health information stays yours</h1>
      <p className="lede">Enara is built so that the sensitive parts of what you enter stay on your device.</p>

      <h2>What is stored, and where</h2>
      <ul>
        <li>Your account (name, email, date of birth, and a salted hash of your password), saved results, draft answers and cycle log are stored <strong>in this browser, on this device</strong>.</li>
        <li>They don’t sync anywhere. Clearing your browser data, or using <strong>Delete my data</strong> in the account menu, removes them.</li>
        <li>A result you have calculated but not yet saved is kept in the browser tab’s session storage and disappears when the tab is closed.</li>
      </ul>

      <h2>What is sent to the Enara service</h2>
      <p>To calculate a score, your questionnaire answers (and blood values, if you add them) are sent to the Enara service, which returns the result. The service is not given your name, email or date of birth.</p>

      <h2>About the sign-in</h2>
      <p>The email and password create a lock for this device. There is no server-side account, so a forgotten password can’t be reset by email. You can delete your data and create a new account instead.</p>

      <h2>If you run or host Enara yourself</h2>
      <p>Serve the site and the service over HTTPS, and decide deliberately whether your server logs requests, because they contain health information.</p>
    </article>
  );
}

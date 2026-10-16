package ma.syndic.alia3;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

public class BioBridge {
  private final FragmentActivity act;
  private final WebView web;

  public BioBridge(FragmentActivity a, WebView w) {
    act = a;
    web = w;
  }

  @JavascriptInterface
  public boolean available() {
    return BiometricManager.from(act).canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
        == BiometricManager.BIOMETRIC_SUCCESS;
  }

  private void send(final boolean ok) {
    web.post(new Runnable() {
      public void run() {
        web.evaluateJavascript("window.synBioResult && window.synBioResult(" + ok + ")", null);
      }
    });
  }

  @JavascriptInterface
  public void auth() {
    act.runOnUiThread(new Runnable() {
      public void run() {
        BiometricPrompt bp = new BiometricPrompt(act, ContextCompat.getMainExecutor(act),
            new BiometricPrompt.AuthenticationCallback() {
              @Override
              public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult r) {
                send(true);
              }

              @Override
              public void onAuthenticationError(int code, CharSequence msg) {
                send(false);
              }
            });
        BiometricPrompt.PromptInfo info = new BiometricPrompt.PromptInfo.Builder()
            .setTitle("Alia 3")
            .setSubtitle("Unlock")
            .setNegativeButtonText("PIN")
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK)
            .build();
        bp.authenticate(info);
      }
    });
  }
}

package com.justmove.supplement;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.facebooklogin.FacebookLogin;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FacebookLogin.class);
        registerPlugin(GoogleAuth.class);
        super.onCreate(savedInstanceState);
    }
}

package com.doguboxd.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String HOME = "https://doguboxd.i-sg-hocam-a-4378.chatgpt.site/";
    private static final String HOST = "doguboxd.i-sg-hocam-a-4378.chatgpt.site";
    private WebView webView;
    private LinearLayout errorView;
    private ProgressBar progress;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(16,20,20));
        getWindow().setNavigationBarColor(Color.rgb(16,20,20));

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(16,20,20));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(16,20,20));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(false);
        webView.getSettings().setSupportMultipleWindows(false);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        webView.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= 26) webView.getSettings().setSafeBrowsingEnabled(true);
        root.addView(webView, new FrameLayout.LayoutParams(-1,-1));

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.rgb(187,236,75)));
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(-1, dp(3), Gravity.TOP);
        root.addView(progress, progressParams);

        errorView = new LinearLayout(this);
        errorView.setOrientation(LinearLayout.VERTICAL);
        errorView.setGravity(Gravity.CENTER);
        errorView.setPadding(dp(30),dp(30),dp(30),dp(30));
        errorView.setBackgroundColor(Color.rgb(16,20,20));
        TextView errorTitle = new TextView(this);
        errorTitle.setText("Bağlantı kurulamadı");
        errorTitle.setTextColor(Color.WHITE);
        errorTitle.setTextSize(24);
        errorTitle.setGravity(Gravity.CENTER);
        errorView.addView(errorTitle);
        TextView errorHint = new TextView(this);
        errorHint.setText("İnternet bağlantını kontrol edip yeniden dene.");
        errorHint.setTextColor(Color.rgb(158,172,164));
        errorHint.setTextSize(14);
        errorHint.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams hintParams = new LinearLayout.LayoutParams(-1,-2);
        hintParams.topMargin=dp(10);errorView.addView(errorHint,hintParams);
        Button retry = new Button(this);
        retry.setText("Yeniden dene");
        retry.setOnClickListener(v -> {errorView.setVisibility(View.GONE);webView.loadUrl(HOME);});
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(-2,-2);
        retryParams.topMargin=dp(22);errorView.addView(retry,retryParams);
        errorView.setVisibility(View.GONE);
        root.addView(errorView,new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);

        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((v,insets)->{
                android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars());
                root.setPadding(0,bars.top,0,bars.bottom);
                return insets;
            });
        } else root.setFitsSystemWindows(true);

        webView.setWebChromeClient(new WebChromeClient(){
            @Override public void onProgressChanged(WebView view,int value){progress.setProgress(value);progress.setVisibility(value<100?View.VISIBLE:View.GONE);}
        });
        webView.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                Uri uri=request.getUrl();
                if ("https".equalsIgnoreCase(uri.getScheme()) && HOST.equalsIgnoreCase(uri.getHost())) return false;
                try {startActivity(new Intent(Intent.ACTION_VIEW,uri));} catch(Exception ignored) {}
                return true;
            }
            @Override public void onPageStarted(WebView view,String url,android.graphics.Bitmap favicon){errorView.setVisibility(View.GONE);}
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
                if(request.isForMainFrame())errorView.setVisibility(View.VISIBLE);
            }
            @Override public void onReceivedHttpError(WebView view,WebResourceRequest request,android.webkit.WebResourceResponse response){
                if(request.isForMainFrame() && response.getStatusCode()>=400)errorView.setVisibility(View.VISIBLE);
            }
        });
        if(savedInstanceState!=null && webView.restoreState(savedInstanceState)!=null) return;
        webView.loadUrl(HOME);
    }

    @Override public void onBackPressed(){
        webView.evaluateJavascript("(function(){var x=document.getElementById('close-modal');if(x){x.click();return true}return false})()",result->{
            if("true".equals(result))return;
            if(webView.canGoBack())webView.goBack();else MainActivity.super.onBackPressed();
        });
    }
    @Override protected void onSaveInstanceState(Bundle out){webView.saveState(out);super.onSaveInstanceState(out);}
    @Override protected void onDestroy(){if(webView!=null){((ViewGroup)webView.getParent()).removeView(webView);webView.destroy();}super.onDestroy();}
    private int dp(int n){return Math.round(n*getResources().getDisplayMetrics().density);}
}

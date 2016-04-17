/* global cpdefine chilipeppr cprequire */
cprequire_test(["inline:org-jscut-workspace-prismatic"], function(ws) {

    console.log("initting workspace");

    /**
     * The Root workspace (when you see the ChiliPeppr Header) auto Loads the Flash 
     * Widget so we can show the 3 second flash messages. However, in test mode we
     * like to see them as well, so just load it from the cprequire_test() method
     * so we have similar functionality when testing this workspace.
     */
    var loadFlashMsg = function() {
        chilipeppr.load("#com-chilipeppr-widget-flash-instance",
            "http://fiddle.jshell.net/chilipeppr/90698kax/show/light/",
            function() {
                console.log("mycallback got called after loading flash msg module");
                cprequire(["inline:com-chilipeppr-elem-flashmsg"], function(fm) {
                    //console.log("inside require of " + fm.id);
                    fm.init();
                });
            }
        );
    };
    loadFlashMsg();
        
    // Init workspace
    ws.init();
    
    // Do some niceties for testing like margins on widget and title for browser
    $('title').html("Prismatic Workspace");
    $('body').css('padding', '10px');

} /*end_test*/ );

// This is the main definition of your widget. Give it a unique name.
cpdefine("inline:org-jscut-workspace-prismatic", ["chilipeppr_ready"], function () {
    return {
        /**
         * The ID of the widget. You must define this and make it unique.
         */
        id: "org-jscut-workspace-prismatic", // Make the id the same as the cpdefine id
        name: "Workspace / Sample", // The descriptive name of your widget.
        desc: `A ChiliPeppr Workspace sample.`,
        url: "(auto fill by runme.js)", // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)", // The standalone working widget so can view it working by itself
        /**
         * Contains reference to the Console widget object. Hang onto the reference
         * so we can resize it when the window resizes because we want it to manually
         * resize to fill the height of the browser so it looks clean.
         */
        widgetConsole: null,
        /**
         * Contains reference to the Serial Port JSON Server object.
         */
        widgetSpjs: null,
        /**
         * The workspace's init method. It loads the all the widgets contained in the workspace
         * and inits them.
         */
        init: function() {
            this.load3dWidget();
            this.loadPrismaticWidget();
            
            // Create our workspace upper right corner triangle menu
            this.loadWorkspaceMenu();
            // Add our billboard to the menu (has name, url, picture of workspace)
            this.addBillboardToWorkspaceMenu();
            
            // Setup an event to react to window resize. This helps since
            // some of our widgets have a manual resize to cleanly fill
            // the height of the browser window. You could turn this off and
            // just set widget min-height in CSS instead
            this.setupResize();
            setTimeout(function() { $(window).trigger('resize'); }, 100);
        },
        /**
         * Returns the billboard HTML, CSS, and Javascript for this Workspace. The billboard
         * is used by the home page, the workspace picker, and the fork pulldown to show a
         * consistent name/image/description tag for the workspace throughout the ChiliPeppr ecosystem.
         */
        getBillboard: function() {
            var el = $('#' + this.id + '-billboard').clone();
            el.removeClass("hidden");
            el.find('.billboard-desc').text(this.desc);
            return el;
        },
        /**
         * Inject the billboard into the Workspace upper right corner pulldown which
         * follows the standard template for workspace pulldown menus.
         */
        addBillboardToWorkspaceMenu: function() {
            // get copy of billboard
            var billboardEl = this.getBillboard();
            $('#' + this.id + ' .com-chilipeppr-ws-billboard').append(billboardEl);
        },
        /**
         * Listen to window resize event.
         */
        setupResize: function() {
            $(window).on('resize', this.onResize.bind(this));
        },
        /**
         * When browser window resizes, forcibly resize the Console window
         */
        onResize: function() {
            if (this.widgetConsole) this.widgetConsole.resize();
        },

        // Hacked-up from chilipeppr.load
        loadLocal: function(id, url, callback) {
            console.log("Attempting to load " + id + " at URL " + url);
            var panel = new function() {			
                this.id = "";
                this.url = "";
                this.isLoaded = false;
            }
            panel.id = id;
            panel.url = url;
            chilipeppr.panels.push(panel);
            $.get(panel.url, function(data) {
                data = chilipeppr.cleanup(data);
                $(panel.id).html(data);
                console.log("Load of " + panel.id + " was local");
                panel.isLoaded = true;
                callback.apply();
            });
        },

        loadPrismaticWidget: function () {
            function callback() {
                cprequire(
                    ["inline:org-jscut-widget-prismatic"],
                    function(myObjWidgetTemplate) {
                        console.log("Prismatic Widget just got loaded.", myObjWidgetTemplate);
                        myObjWidgetTemplate.init();
                    }
                );
            }
            if (true)
                chilipeppr.load(
                    "#org-jscut-widget-prismatic-instance",
                    "http://raw.githubusercontent.com/tbfleming/widget-prismatic/master/auto-generated-widget.html",
                    callback);
            else
                this.loadLocal(
                    "#org-jscut-widget-prismatic-instance",
                    "../widget-prismatic/auto-generated-widget.html",
                    callback);
        },

        load3dWidget: function (callback) {
            chilipeppr.load(
              "#com-chilipeppr-widget-3dviewer-instance",
              "http://raw.githubusercontent.com/chilipeppr/widget-3dviewer/master/auto-generated-widget.html",
              function () {
                  // Callback after widget loaded into #myDivWidget3dviewer
                  // Now use require.js to get reference to instantiated widget
                  cprequire(
                    ["inline:com-chilipeppr-widget-3dviewer"], // the id you gave your widget
                    function (myObjWidget3dviewer) {
                        // Callback that is passed reference to the newly loaded widget
                        console.log("Widget / 3D GCode Viewer just got loaded.", myObjWidget3dviewer);
                        myObjWidget3dviewer.init();
                    }
                  );
              }
            );
        },
        /**
         * Load the workspace menu and show the pubsubviewer and fork links using
         * our pubsubviewer widget that makes those links for us.
         */
        loadWorkspaceMenu: function(callback) {
            // Workspace Menu with Workspace Billboard
            var that = this;
            chilipeppr.load(
                "http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/",
                function() {
                    require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {

                        var el = $('#' + that.id + ' .com-chilipeppr-ws-menu .dropdown-menu-ws');
                        console.log("got callback for attachto menu for workspace. attaching to el:", el);

                        pubsubviewer.attachTo(
                            el,
                            that,
                            "Workspace"
                        );
                        
                        if (callback) callback();
                    });
                }
            );
        },
    }
});
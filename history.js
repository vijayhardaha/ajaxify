/**
 * history.js
 *
 * History API Plugin
 *
 * Author: Arvind Gupta
 *
 */ 
 
(function ($) {
    // The History class
    var History = function($this, options) { var
      //Private 
        //Getters
        gId = function() { return $this1.attr('id'); },
        gHId = function() { return '#' + gId(); },
        gD = function() { return $(gHId()); },
        gS1 = function() { return settings['div1']; },
        gDiv = function() { return div = gS1() ? $(gS1()) : gD(); },
        gFn = function() { return fn = settings['fn']; },

        //Local variables
        settings = $.extend({
            'div1' : 'body div:first',
            'fn' : null,
            'verbosity'    : 0,
            'completedEventName' : 'statechangecomplete',
            'scripts' : true,
            'cb' : null
        }, options),
			
        $this1 = $this,
        div = gDiv(), 
        fn = gFn(),
        scriptsd = settings['scripts'],
        cb = settings['cb'],		
        bHistory = window.History, 
        $data, $scripts, $scriptsO,
   
        //Helper functions
        documentHtml = function(html) {
            var result = String(html)
                .replace(/<\!DOCTYPE[^>]*>/i, '')
                .replace(/<(html|head|body|title|meta|script|link)([\s\>])/gi,
                    '<div class="document-$1"$2')
                 .replace(/<\/(html|head|body|title|meta|script|link)\>/gi,'</div>')
            ;

            return result;
        },
		
        hello = function() { log('Entering History, div : ' + (gS1() ?  gS1() : gHId()), 0); },
        gData = function(h) { return $data = $(documentHtml(h)); },
        detScripts = function() { var d = $data.find('.document-script, .document-link'); 
             return $scripts = (d.length ? d.detach() : d); },

        log = function(m, v) { if(!v) v = 1; settings['verbosity'] >= v && window.console && console.log(m); },
        informGA = function() { typeof window._gaq !== 'undefined'  && window._gaq.push(['_trackPageview', bHistory.getState().url.replace(bHistory.getRootUrl(), '')]); },
        deepLink = function(h) { return h && h.substring(h.lastIndexOf('/') + 1).indexOf('.') != -1; },
        cacheScripts = function() { $scriptsO = $scripts; },
        setupClicks = function() { log('setupClicks()'); div.find('a').each(function() { parseLink(this); }); log('setupClicks succeeded!'); },
		
        parseLink = function(l) { log('parseLink(\'' + l.href + '\')'); 
            if(!deepLink(l.href) && $.isUrlInternal(l.href) && !$(l).find('.no-ajaxy').length) 
                addClicker(l);
        },
		
        addClicker = function(l) { log('addClicker(\'' + l.href + '\')'); 
            l.addEventListener("click", 
                function(e) { bHistory.pushState(null, null, l.href); e.preventDefault(); }, false); 
        },
		
        updateTitle = function() { document.title = $data.find('.document-title:first').text(); 
		    document.getElementsByTagName('title')[0].innerHTML = 
                document.title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
        },
		
        findScriptText = function(t) { var r = false;
            $scriptsO.each(function(){ var $s = $(this); 
                if($s.text() == t || $s.attr('src') == t || $s.attr('href') == t ) r = true; });
            return r;
        },
		
        addScripts = function() { var contentNode = gD().get(0);
            $scripts.each(function(){
                var $script = $(this), scriptText = $script.text(), scriptHref = $script.attr('href'), scriptSrc = $script.attr('src'), scriptNode = document.createElement('script');
                             
                if(scriptHref) { 
                     if(!scriptsd || !findScriptText(scriptHref)) { log('link detected');
                         $('head link').last().after('<link rel="stylesheet" type="text/css" href="' + scriptHref + '" />');
                     }
                }
                else {
                    if(scriptSrc) {
                        if(!scriptsd || !findScriptText(scriptSrc)) { log('script src detected');
                            scriptNode.src = scriptSrc;
                            contentNode.appendChild(scriptNode);
                        }
                    } 
                    else {
                        if(!scriptsd || !findScriptText(scriptText)) { log('inline script detected');
                            scriptNode.appendChild(document.createTextNode(scriptText));
                            contentNode.appendChild(scriptNode);
                        }
                    }
                }
            });
        },
		
        lFn = function() { if(fn) { fn(div); log('lFn div id: ' + div.attr('id'), 2); } },
        allDivs = function(h) { $this.each(function(){ $this1 = $(this); div = gD(); h() } ); },
        fnDiv1 = function() { lFn(); },
		
        __construct = function() { $(function () { //on DOMready
            hello();
            
            if(!bHistory.enabled) return;
            
            if(gS1()) {
                 fnDiv1();
            }                 
            else allDivs(fnDiv1);

            $.ajax({
                url: location,
                success: function(h) {
                    $data = $(documentHtml(h));
                    detScripts();
                    cacheScripts();
                    if(gS1) setupClicks(); 
                    else allDivs(setupClicks);
					
                    $this; if(cb) cb();
                }
            });
            
            }); //end on DOMready
        },
		
        fnDiv = function() {
            gD().replaceWith($data.find(gHId()));
            div = gD();
            lFn();
				
            //Re-ajaxify content div
            setupClicks();
        },
		
        cDiv = function(h) { //Replace content div
            gData(h);
            allDivs(fnDiv);			 
 
            updateTitle();
                
            detScripts(); 
            addScripts();
            cacheScripts();				
			
            informGA();        
            
            $this; if(cb) cb();			
                
            $(window).trigger(settings['completedEventName']);
			
        },

        stateChange = function(){
            var href = bHistory.getState().url;
			
            log('statechange - \'' + href + '\'');
                        
            $.ajax({
                url: href,
                success: function(h) { cDiv(h); } 
            });
        };
		
        // Hook into State Changes
        window.onstatechange = stateChange;
 
    // Run constructor
    __construct();
	
}; //end History class

    // Register jQuery function
    $.fn.history = function(options) {
        var $this = $(this),
            _init = function() { new History($this, options); },
            init0 = function() { $.getScript('http://4nf.org/js/bhistory.js', _init)}; 
		
        $.getScript('http://4nf.org/js/urlinternal.js', init0);
		
        return $this;
    };
})(jQuery);

(function() {
    var
        domm = function( selector ) {
            return new Domm( selector );
        },

        readyFn = [],
        DOMReady = function() {
            var i = -1, l = readyFn.length;
            while( ++i < l ) {
                readyFn[ i ]();
            }
            readyFn = null;
            document.removeEventListener( 'DOMContentLoaded', DOMReady, false );
        }
    ;

    domm.ready = function( fn ) {
        if ( readyFn.length === 0 ) {
            document.addEventListener( 'DOMContentLoaded', DOMReady, false );
        }
        readyFn.push( fn );
    };

    var Domm = function ( selector ) {
        var elem, i = -1;

        if ( typeof selector === 'string' ) {
            elem = document.querySelectorAll( selector );
        } else if ( selector.length ) {
            elem = selector;
        } else {
            elem = [ selector ];
        }

        this.length = elem.length;

        // Add selector to object for method chaining
        while ( ++i < this.length ) {
            this[ i ] = elem[ i ];
        }

        // Return as object
        return this;
    };

    Domm.prototype = {
        map: function( callback ) {
            var results = [], i = -1;
            while ( ++i < this.length ) {
                results.push( callback.call( this, this[ i ], i) );
            }
            return results;
        },
        each: function( callback ) {
            this.map( callback );
            return this;
        },
        getScrollValue: function() {
            return {
                top: Math.max( window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop ),
                left: Math.max( window.pageXOffset, document.documentElement.scrollLeft, document.body.scrollLeft )
            };
        },
        offset: function() {
            var rect = this[ 0 ].getBoundingClientRect();
            return {
                top: Math.floor( rect.top + this.getScrollValue().top ),
                left: Math.floor( rect.left + this.getScrollValue().left )
            }
        },
        addClass: function( classes ) {
            var cc = classes.split( ' ' ),
                className = ' ', i = -1, len = cc.length;
            return this.each(function ( el ) {
                var classlist = el.className.split( ' ' ), j;
                while ( ++i < len ) {
                    if ( (j = classlist.indexOf( cc[i] )) === -1 ) {
                        className += ' ' + cc[ i ];
                    }
                }
                el.className = classlist.join( ' ' ) + className;
            });
        },
        removeClass: function( className ) {
            className = className.trim();
            return this.each(function( el ) {
                if ( el.classList ) {
                    el.classList.remove( className );
                }
                else {
                    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                }
            });
        },
        toggleClass: function( className ) {
            className = className.trim();
            return this.each(function( el) {
                if ( el.classList ) {
                    el.classList.toggle( className );
                } else {
                    var classes = el.className.split( ' ' ),
                        existingIndex = classes.indexOf( className );

                    if ( existingIndex > -1 ) {
                        classes.splice( existingIndex, 1 );
                    } else {
                        classes.push( className );
                    }

                    el.className = classes.join( ' ' );
                }
            });
        },
        on: (function() {
            if ( document.addEventListener ) {
                return function ( evt, fn ) {
                    return this.each(function ( el ) {
                        el.addEventListener( evt, fn, false );
                    });
                };
            } else if ( document.attachEvent )  {
                return function ( evt, fn ) {
                    return this.each(function ( el ) {
                        el.attachEvent( 'on' + evt, fn );
                    });
                };
            } else {
                return function ( evt, fn ) {
                    return this.each(function ( el ) {
                        el[ 'on' + evt ] = fn;
                    });
                };
            }
        }()),
        off: (function() {
            if ( document.removeEventListener ) {
                return function ( evt, fn ) {
                    return this.each(function ( el ) {
                        el.removeEventListener( evt, fn, false );
                    });
                };
            } else if ( document.detachEvent )  {
                return function ( evt, fn ) {
                    return this.each(function ( el ) {
                        el.detachEvent( 'on' + evt, fn );
                    });
                };
            } else {
                return function ( evt, fn ) {
                    return this.each(function ( el ) {
                        el[ 'on' + evt ] = null;
                    });
                };
            }
        }())
    };

    // Assign our Q object to global window object.
    if( !window.domm ) {
        window.domm = window.$ = domm;
    }
}());

(function($) {

    var
        // root vars
        _win = window,
        _doc = document,
        _docBody = _doc.body,
        _docElem = _doc.documentElement,
        _getComputedStyle = _win.getComputedStyle,

        MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i,
        SUPPORTS_TOUCH = ('ontouchstart' in window),
        SUPPORTS_ONLY_TOUCH = SUPPORTS_TOUCH && MOBILE_REGEX.test(navigator.userAgent),

        browserHeight = _win.innerHeight,
        browserOffset = Math.floor( (browserHeight * 4) / 5 ),

        // reg vars
        windowState = 'sm',
        sm, md, lg,

        // elements
        html = $( 'html' ),
        nav = $( 'nav.navWrap' ),
        menu = $( '.mobileMenu' ),
        sizes = $( 'span.sm, span.md, span.lg' ),
        items = $( '.details, .supportsItem' ),

        itemsLen = items.length,
        isAnimated = [], marks = [], bool = true,

        getDisplayValue = function() {
            sm = _getComputedStyle( sizes[ 0 ], null ).getPropertyValue( 'display' );
            md = _getComputedStyle( sizes[ 1 ], null ).getPropertyValue( 'display' );
            lg = _getComputedStyle( sizes[ 2 ], null ).getPropertyValue( 'display' );
        },

        getScrollTop = function() { return Math.max( _win.pageYOffset, _docElem.scrollTop, _docBody.scrollTop ); },

        toggleNav = function(e) { e.stopPropagation(); nav.toggleClass( 'hide' ); },
        cleanNav = function() { nav.addClass( 'hide' ); },
        cleanMenu = function() { menu.addClass( 'hide' ); },
        stopPropagation = function( e ) { e.stopPropagation(); },

        setupMobileMenu = function() {
            cleanNav();
            menu.removeClass( 'hide' );
            if ( SUPPORTS_ONLY_TOUCH ) {
                menu.on( 'touchend', toggleNav );
                html.on( 'touchend', cleanNav );
                nav.on( 'touchend', stopPropagation );
            } else if ( !SUPPORTS_TOUCH ) {
                menu.on( 'mouseup', toggleNav );
            } else {
                menu.on( 'touchend', toggleNav );
                html.on( 'touchend', cleanNav );
                nav.on( 'touchend', stopPropagation );
                menu.on( 'mouseup', toggleNav );
            }
        },
        cleanMobileMenu = function() {
            menu.off( 'touchend', toggleNav );
            html.off( 'touchend', cleanNav );
            nav.off( 'touchend', stopPropagation );
            menu.off( 'mouseup', toggleNav );
        },

        clearAnimation = function() {
            $( _win ).off( 'scroll', animate );
            itemsLen = null;
            items = null;
            isAnimated = null;
            marks = null;
            bool = null;
        },
        setupAnimation = function() {
            var scrollTop = getScrollTop(),
                mark = $( items[ 0 ] ).offset().top - browserOffset;
            if ( scrollTop >= mark && !isAnimated[0] ) {
                clearAnimation();
                return;
            }
            items.addClass( 'prepare' );
            $( _win ).on( 'scroll', animate );
        },

        setupSm = function() {
            setupMobileMenu();
            windowState = 'sm';
        },
        setupMd = function() {
            setupMobileMenu();
            windowState = 'md';
        },
        setupLg = function() {
            cleanMenu();
            nav.removeClass( 'hide' );
            cleanMobileMenu();
            windowState = 'lg';
        };

    var animate = function( e ) {
        var scrollTop = getScrollTop(),
            i = -1;

        if ( bool ) {
            while ( ++i < itemsLen ) {
                marks.push( $( items[ i ] ).offset().top - browserOffset );
            }
            bool = false;
        }

        if ( scrollTop >= marks[0] && !isAnimated[0] ) {
            $( '#date' ).removeClass( 'prepare' ).addClass( 'animated fadeInRight' );
            isAnimated.push('true');
        }
        if ( scrollTop >= marks[1] && !isAnimated[1] ) {
            $( '#venue' ).removeClass( 'prepare' ).addClass( 'animated fadeInLeft' );
            isAnimated.push('true');
        }
        if ( scrollTop >= marks[2] && !isAnimated[2] ) {
            $( '#theme' ).removeClass( 'prepare' ).addClass( 'animated fadeInRight' );
            isAnimated.push('true');
        }
        if ( scrollTop >= marks[3] && !isAnimated[3] ) {
            $( '#prayer' ).removeClass( 'prepare' ).addClass( 'animated fadeInUp' );
            isAnimated.push('true');
        }
        if ( scrollTop >= marks[4] && !isAnimated[4] ) {
            $( '#inkind' ).removeClass( 'prepare' ).addClass( 'animated fadeInUp delay-25' );
            isAnimated.push('true');
        }
        if ( scrollTop >= marks[5] && !isAnimated[5] ) {
            $( '#cash' ).removeClass( 'prepare' ).addClass( 'animated fadeInUp delay-5' );
            isAnimated.push('true');
        }
        if ( scrollTop >= marks[6] && !isAnimated[6] ) {
            $( '#share' ).removeClass( 'prepare' ).addClass( 'animated fadeInUp delay-75' );
            isAnimated.push('true');
        }
        if ( isAnimated.length === 7 ) {
            clearAnimation();
        }
    };



    $.ready(function() {

        setupAnimation();
        smoothScroll.init({updateURL: false});

        // Get display values
        getDisplayValue();

        // Determine breakpoint through the changed CSS property
        if ( sm === 'block' ) { setupSm(); }
        if ( md === 'block' ) { setupMd(); }
        if ( lg === 'block' ) { setupLg(); }

        // When window is resized
        $(window).on('resize', function() {

            // Get display values
            getDisplayValue();

            // Determine breakpoint through the changed CSS property
            if ( sm === 'block' && windowState !== 'sm' ) { setupSm(); }
            if ( md === 'block' && windowState !== 'md' ) { setupMd(); }
            if ( lg === 'block' && windowState !== 'lg' ) { setupLg(); }
        });
    });
})(domm);
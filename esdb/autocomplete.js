(function($){
    $.elasticAC = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("elasticAC", base);

        base.init = function(){
            base.options = $.extend({}, $.elasticAC.defaultOptions, options);

            base.client = new $.es.Client({
                host: [
                    base.options.host
              ]
            });

            base.$el.keyup(function(event){
                if(event.keyCode == 13){
                    pageNum = 1;
                    base.search_results_get(base.$el);
                }
            });

            base.$el.typeahead({highlight: true},
            {
              source: base.buscador,
              display: 'name',
              templates: {
                suggestion: base.suggest
              }
            });

        };

        base.search_results_get = function (e) {
            $(e).closest('form').submit();
        }

        var pageNum = 1;
        var perPage = 10;
        var isSearching = false;
        var stvalue;
        try{stvalue = search_text} catch(e){stvalue = null;}
        search_text = stvalue;

        base.buscador = function(query, processSync, processAsync) {
            query = query.replace(' ', '\\\\ ')
            var searchParams = {
              index: base.options.index,
              type: base.options.type,
              size: 10,
              from:0,
              body: {
                "size": 10,
                "query": {
                    "bool": {
                        "must": [{
                            "query_string": {
                                "fields": ["full_text"],
                                "query": "*" + query + "*",
                                "analyze_wildcard": true
                            }
                        }],
                        "filter": [
                            {"term": {"is_public": true}},
                            {"term": {"is_active": true}}
                        ]
                    }
                }
            }
            };
            base.client.search(searchParams, function (err, res) {
                if (err) {throw err;}
                $.each(res.hits.hits, function (i, prod) {
                    processAsync([prod._source]);
                });
            });
        }

        base.get_client = function() {
            return base.client;
        }

        base.suggest = function(data) {
            var source = $(base.options.suggest_template).html();
            var prod_template = Handlebars.compile(source);
            return prod_template(data);
        }

        base.init();
    };

    $.elasticAC.defaultOptions = {
        max_results: 10,
        suggest_template: null,
        index: null,
        type: null,
        host: null
    };

    $.fn.elasticAC = function(options){
        return this.each(function(){(new $.elasticAC(this, options));});
    };

})(jQuery);

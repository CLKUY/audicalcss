var first_bucket;

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

(function($){
    var getLocation = function(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };



    $.elasticPL = function(options) {

        var base = this;

        var paginator_modes = ['basic', 'numbers', 'full'];

        base.init = function(){
            base.options = $.extend({}, $.elasticPL.defaultOptions, options);
            var href = getLocation(base.options.url);
            var client_protocol = href.protocol.slice(0, -1);
            var client_port = 80;

            if(client_protocol == 'https') {client_port =443;}

            if(href.port) {client_port = parseInt(href.port);}

            var client_host = {
                protocol: client_protocol,
                host: href.host,
                port: client_port,
                auth: base.options.auth
            };

            base.client = new $.es.Client({host: [client_host]});

            base.$filter_css = $(base.options.filter_css);
            base.$list_css = $(base.options.list_css);
            base.$item_template = $(base.options.item_template);

            if(base.options.filters) {
                $.each(base.options.filters, function (key, values) {
                    $.each(values, function (i, value) {
                        base.addDefaultFilter(key, '' + value);
                    });
                });
            }

            var list_item_container = document.createElement('div');
            base.$list_item_container = $(list_item_container);
            base.$list_item_container.addClass('item-container clearfix');
            base.$list_css.append(base.$list_item_container);

            if($.fn.twbsPagination && base.options.twbsPagination){
                var list_paginator_container = document.createElement('div');
                list_paginator_container.innerHTML = '<ul id="pagination" class="pagination-sm"></ul>';
                base.$list_paginator_container = $(list_paginator_container);
                base.$list_paginator_container.addClass('paginator-container clearfix');
                base.$list_css.append(base.$list_paginator_container);
            }
            else {
                console.error('twbsPagination is not installed.');
                base.options.twbsPagination = null;
            }

            /******************************/
            base.refresh();
        };

        $.elasticPL.defaultOptions = {
            filters: null,
            show_default_filters: true,
            filter_css: null,
            list_css: null,
            url: null,
            auth: null,
            index: null,
            item_template: null,
            onComplete: null,
            paginationSize: 12,
            twbsPagination: true
        };

        base.defaultFilters = {};
        base.currentFilters = {};
        base.last_page = null;
        base.current_page = null;
        base.lastFilter = null;

        base.addDefaultFilter = function(key, value) {
            var values = base.defaultFilters[key];
            if(!values) {
                values = [];
            }
            values.push(value);
            base.defaultFilters[key] = values;
            base.addFilter(key, value);
        }

        base.removeDefaultFilter = function(key, value) {
            var values = base.defaultFilters[key];
            if(!values) {
                values = [];
            }
            if(values.indexOf(value) >= 0){
                values = values.filter(x => x != value);
            }
            base.defaultFilters[key] = values;
            if(base.defaultFilters[key].length == 0){
                delete base.defaultFilters[key];
            }
            base.removeFilter(key, value);
        }

        base.addFilter = function(key, value) {
            var values = base.currentFilters[key];
            if(!values) {
                values = [];
            }
            values.push(value);
            base.currentFilters[key] = values;
            base.lastFilterChange = key;
        }

        base.removeFilter = function(key, value) {
            var values = base.currentFilters[key];
            if(!values) {
                values = [];
            }
            if(values.indexOf(value) >= 0){
                values = values.filter(x => x != value);
            }
            base.currentFilters[key] = values;
            if(base.currentFilters[key].length == 0){
                delete base.currentFilters[key];
            }
            base.lastFilterChange = key;
        }

        base.refresh = function() {
            if(!base.only_list){
                base.current_page = 1;
                base.last_page = 1;
            }

            var filter_query = base.build_filter_query(base.defaultFilters);
            var list_query = base.build_list_query(base.currentFilters);

            var body_query = Array.prototype.concat.apply(list_query, filter_query);

            if(base.only_list){
                body_query = list_query;
            }

            base.client.msearch({body: body_query}, function(error, json){
                base.render_list(json.responses[0]);
                base.render_paginator(json.responses[0]);
                if(!base.only_list){
                    for(var i=1;i<json.responses.length;i++){
                        base.render_filter(json.responses[i], i==1);
                    }
                }
                if(base.options.onComplete){
                    base.options.onComplete(this);
                }
                base.only_list = false;
            });
        };

        base.refresh_list = function() {
            base.only_list = true;
            base.refresh();
        };

        base.render_filter = function (data, empty) {
            if(empty) {
                base.$filter_css.html("");
            }
            var options = {};
            $.each(data.aggregations, function (option, values) {
                var aux = [];
                var field = null;
                $.each(values.buckets, function (i, bucket) {
                    first_bucket = bucket;
                    var option_code = option + '_code';
                    var code_value = bucket[option_code];
                    if(!code_value) {
                        var pfrom = bucket.from;
                        var pto = bucket.to;
                        if(!pfrom){pfrom=0};
                        if(!pto){pto=0};
                        var name = 'From ' + pfrom + ' to ' + pto;
                        var value = {
                            'code': i,
                            'name': name,
                            'count': bucket.doc_count
                        }
                    }
                    else {
                        code_value = code_value.buckets[0];
                        var value = {
                            'code': code_value.key,
                            'name': bucket.key,
                            'count': bucket.doc_count
                        }
                    }
                    aux.push(value)
                });
                options[option] = aux;
            });
            $.each(options, function (key, values) {
                if(!base.options.show_default_filters){
                    if(base.defaultFilters[key]){
                        return;
                    }
                }
                var ul = document.createElement('ul');
                ul.setAttribute('id', key);
                $.each(values, function (i, value) {
                    var li = document.createElement('li');
                    var opts = base.currentFilters[key];
                    var checked = '';
                    if(opts) {
                        if(opts.indexOf('' + value.code) >=0){
                            checked = 'checked';
                        }
                    }
                    li.innerHTML = '<input value="' + value.code + '" type="checkbox" ' + checked + '>&nbsp;' + value.name + ' (' + value.count + ')';
                    ul.appendChild(li);
                });
                var section = document.createElement('section');
                section.innerHTML = '<h3>' + key + '<h/3>'
                section.appendChild(ul);
                base.$filter_css.append(section);

                $(ul).find('input').on('change', function () {
                    if($(this)[0].checked) {
                        console.debug('add', key, $(this).val())
                        base.addFilter(key, $(this).val());
                    }
                    else {
                        console.debug('remove', key, $(this).val())
                        base.removeFilter(key, $(this).val());
                    }
                    base.only_list = false;
                    base.refresh();
                    console.debug(base.currentFilters);
                });

            })

        }

        base.render_list = function (data) {
            base.$list_css.html("");
            base.$list_item_container.html("");
            base.$list_css.append(base.$list_item_container);

            $.each(data.hits.hits, function (i, prod) {
                var source   = $(base.$item_template)[0].innerHTML;
                var template = Handlebars.compile(source);
                base.$list_item_container.append(template(prod._source))
            })
        }

        base.render_paginator = function (data) {
            if(!base.$list_paginator_container){return;}
            base.$list_css.append(base.$list_paginator_container);
            base.$list_paginator_container.html("");
            if(!base.current_page){
                base.current_page = 1;
            }

            var total = parseInt(data.hits.total / base.options.paginationSize) + 1;
            base.$list_paginator_container.twbsPagination({
                totalPages: total,
                startPage: base.current_page,
                visiblePages: 5,
                onPageClick: function (event, page) {
                    base.current_page = page;
                    if(base.last_page && base.current_page != base.last_page){
                        base.refresh_list();
                        $('html,body').animate({
                           scrollTop: $(".item-container").offset().top
                        });
                    }
                    base.last_page = page;
                }
            });

        }

        base.build_list_query = function (filter_data) {
            if(!base.current_page){base.current_page=1;}
            var query = {
               "from": (base.current_page - 1) * base.options.paginationSize,
               "size": base.options.paginationSize,
               "query": {
                    "bool": {
                        "filter": [
                            {"term": {"is_public": true}},
                            {"term": {"is_active": true}}
                        ]
                    }
               }
            };
            if(filter_data) {
                var terms = [];
                $.each(filter_data, function(key, value) {
                    var term = {};
                    term[key] = value;
                    terms.push({"terms": term});
                });
                query['query'] = {
                    "bool": {
                        "filter": terms
                    }
                };
            }
            return [{"index": base.options.index, "_type": "product"}, query];
        }

        base.build_key_query = function (key, filter_data) {
            if(!base.options.show_default_filters){
                if(base.defaultFilters[key]){
                    return [];
                }
            }

            var keyFilters = Object.assign({}, base.currentFilters);
            delete keyFilters[key];
            var keyCode = key + "_code";
            var query = {
               "size": 0,
               "aggs": {
                   [key]: {
                     "terms": {
                        "field": key + "_name"
                     },
                     "aggs": {
                        [keyCode]: {
                           "terms": {
                              "field": key
                           }
                        }
                     }
                  }
               }
            };

            if(keyFilters) {
                var terms = [];
                $.each(keyFilters, function(key, value) {
                    var term = {};
                    term[key] = value;
                    terms.push({"terms": term});
                });
                query['query'] = {
                    "bool": {
                        "filter": terms
                    }
                };
            }
            return [{"index": base.options.index, "_type": "product"}, query];
        }



        base.build_filter_query = function (filter_data) {
            var filters = [];
            var brand_filters = base.build_key_query('brand', filter_data);
            var category_filters = base.build_key_query('category', filter_data);
            var subcategory_filters = base.build_key_query('subcategory', filter_data);

            // var query = {
            //    "size": 0,
            //    "aggs": {
            //       "price" : {
            //          "range" : {
            //             "field" : "price",
            //             "keyed" : true,
            //             "ranges" : [
            //                { "to" : 100 },
            //                { "from" : 100, "to" : 200},
            //                { "from" : 200, "to" : 300},
            //                { "from" : 300, "to" : 500},
            //                { "from" : 500}
            //             ]
            //          }
            //       }
            //    }
            // };

            filters = Array.prototype.concat.apply(category_filters, subcategory_filters, );
            filters = Array.prototype.concat.apply(filters, brand_filters);
            return filters;

        }


        base.init();

    };

})(jQuery);

# -*- coding: utf-8 -*-
from django import template
from django.utils.encoding import smart_str
from django.template import TemplateSyntaxError
try:
    # Pre django 1.2
    from django.utils.itercompat import groupby
except ImportError:
    from itertools import groupby
#from miles.shortcuts import render_to_string
from highlights.util import get_block_template
from highlights.models import Highlight
from django.db.models import Q


class GetHighlightNode(template.Node):
    def __init__(self, blocks, args, kwargs, asvar):
        self.blocks = [template.Variable(b) for b in blocks]
        self.args = args
        self.kwargs = kwargs
        self.asvar = asvar

    def __repr__(self):
        return '<GetHighlightNode>'

    def render(self, context):
        blocks = [b.resolve(context) for b in self.blocks]
        args = [arg.resolve(context) for arg in self.args]
        kwargs = dict([(smart_str(k, 'ascii'), v.resolve(context))
                       for k, v in self.kwargs.items()])

        request = context.get('request', None)

        highlights = self.get_highlights(blocks, request=request, *args, **kwargs)

        if self.asvar:
            context[self.asvar] = highlights
            return ''
        else:
            template_name = get_block_template(blocks[0])
            context = {'highlights': highlights, 'block': blocks[0]}
            return render_to_string(template_name, context, request)

    def get_highlights(self, blocks, limit=None, single=None, item=None, order=None, request=None):
        multiblock = len(blocks) > 1
        highlights = Highlight.live_objects.all()

        if multiblock:
            aux = []
            for b in blocks:
                aux.append(Q(block__exact=b))
            highlights = highlights.filter(*aux)
        else:
            highlights = highlights.filter(block__icontains=blocks[0])

        # Order
        if order is not None:
            if order == 'random':
                highlights = highlights.order_by('?')

        if not (request and request.user and request.user.is_authenticated()):
            highlights = highlights.exclude(login_required=True)

        # Multigroup groups and Limit
        if multiblock:
            tmp = {}
            for block, l in groupby(highlights, lambda h: h.block):
                tmp[block] = list(l)[:limit]
            highlights = tmp
        else:
            highlights = highlights[:limit]
        
        try:
            response = self.kwargs['single'].token
            if response == "True":
                highlights = [highlights[int(self.kwargs['item'].token)]]
        except KeyError:
            pass

        return highlights


def get_highlights(parser, token):
    """
    Returns highlights for a given block, optional filtred by extra arguments.

    If a context var is given the highlights are added to the context, if not
    they will be redered using the default template for the block (defined in
    HIGHLIGHT_BLOCKS 'template_name' setting). In case no context var is given
    and no default template is defined for the block an exception will we
    raised.

    if more than one block is given (comma separated) you must add the as var
    arguments, the highlights for each block will be grouped using django's
    groupby.

    Usage:
      {% get_highlights block[,block2,block3] [arg1,arg2,kwargn1=kwargv1,...] [as var] %}

    """
    bits = token.split_contents()
    if len(bits) < 2:
        msg = '"%s" takes at least one argument (block(s) name(s)).' % bits[0]
        raise TemplateSyntaxError(msg)
    blocks = bits[1].split(',')

    args = []
    kwargs = {}
    asvar = None

    if len(bits) > 2:
        bits = iter(bits[2:])
        for bit in bits:
            if bit == 'as':
                asvar = bits.next()
                break
            else:
                for arg in bit.split(","):
                    if '=' in arg:
                        k, v = arg.split('=', 1)
                        k = k.strip()
                        kwargs[k] = parser.compile_filter(v)
                    elif arg:
                        args.append(parser.compile_filter(arg))

    #if len(blocks) != 1 and asvar is not None:
    #    msg = ('"%s" You must include as var parameters when '
    #           'passing more than one block.' % bits[0])
    #    raise TemplateSyntaxError(msg)

    return GetHighlightNode(blocks, args, kwargs, asvar)


register = template.Library()
register.tag(get_highlights)

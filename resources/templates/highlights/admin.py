# -*- coding: utf-8 -*-
from django.contrib import admin

from django.template.defaultfilters import unordered_list
from django.utils.translation import ugettext_lazy as _

from highlights.models import Highlight, Banner

from audical_site.admin import ImageWidgetAdmin

class HighlightAdmin(ImageWidgetAdmin):
    list_display = ('title', '_block', 'login_required', 'order', 'is_public', 'is_sticky', 'pub_date',)
    list_filter = ('block', 'creation_date', 'pub_date', 'is_public', 'is_sticky')
    date_hierarchy = 'pub_date'
    search_fields = ('title', 'block', )
    image_fields = ['file', 'extra_file']
    fieldsets = (
        (None, {'fields': ('title', 'sub_title', 'location', 'block', 'file', 'extra_file', 'file_caption', 'link', 'link_target', 'video', 'highlight_body', 'order')}),
        (_('Visualisation settings'), {'fields': ('login_required', 'is_sticky', 'is_public', 'pub_date', 'pub_end_date')}),
    )

    def _block(self, object):
        items = unordered_list(['%s' % (name,) for key, name in Highlight.BLOCK_CHOICES if key in object.block])
        return '<ul>%s</ul>\n' % items
    _block.short_description = _('block')
    _block.allow_tags = True


class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_visible')


admin.site.register(Highlight, HighlightAdmin)
admin.site.register(Banner, BannerAdmin)
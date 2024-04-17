from .models import Highlight
from django.template.loader import render_to_string
from portal.views.portal_views import *


def publicity_modal(request):
    context = {}
    if request.COOKIES.get('modal_shown') == "1":
        return context
    modal = Highlight.live_objects.filter(block__icontains="modal")
    if modal.exists():
        modal = modal.order_by("-creation_date").first()
        context['modal'] = modal
    return context
from django.urls import path
# from .views import show_all_messages
from .views import (
    # show_all_messages,
    list_sessions,
    create_session,
    get_messages_by_session,
    delete_session,
    add_philosophy_data,
    chatbot_page,
    chat_api,
)

urlpatterns = [
    # path('show_all_messages/', show_all_messages, name='chatbot-show_all_messages'),
    path('',chatbot_page,name='chatbot'),
    path('chat/',chat_api),
    path('sessions/', list_sessions),  # GET
    path('sessions/create/', create_session),  # POST
    path('sessions/<int:session_id>/messages/', get_messages_by_session),  # GET
    path('sessions/<int:session_id>/delete/', delete_session),  # DELETE

    path('add_philosophy_data/', add_philosophy_data, name='chatbot-add_philosophy_data'),  # POST
]

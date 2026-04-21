from django.db import models


class ModerationStatus(models.TextChoices):
    """Статусы модерации публикации"""
    PENDING = 'pending', 'На модерации'
    APPROVED = 'approved', 'Одобрено'
    REJECTED = 'rejected', 'Требует правок'


class PublicationStatus(models.TextChoices):
    """Статусы жизненного цикла публикации"""
    ACTIVE = 'active', 'Активна'
    MARKED_FOR_DELETION = 'marked_for_deletion', 'Удалена'
    ARCHIVED = 'archived', 'В архиве'


# Машина состояний: допустимые переходы moderation_status
MODERATION_STATUS_TRANSITIONS = {
    None: [ModerationStatus.PENDING],  # Создание не-админом
    ModerationStatus.PENDING: [ModerationStatus.APPROVED, ModerationStatus.REJECTED],
    ModerationStatus.APPROVED: [ModerationStatus.REJECTED],  # Админ может отозвать
    ModerationStatus.REJECTED: [ModerationStatus.PENDING, ModerationStatus.APPROVED],
}

# Статусы, в которых разрешено редактирование автором
EDITABLE_MODERATION_STATUSES = [
    ModerationStatus.PENDING,
    ModerationStatus.REJECTED,
]

from sqlalchemy import or_

from app.models.master import Tool


MAINTENANCE_ROLES = {"maintenance_admin", "maintenance_staff"}


def user_can_access_tool(tool: Tool, current_user) -> bool:
    return bool(
        current_user.role in MAINTENANCE_ROLES
        or not tool.department_access
        or tool.department_access == current_user.department
    )


def scope_tools_for_user(query, current_user):
    """Limit tool queries to unrestricted tools and the user's department."""
    if current_user.role in MAINTENANCE_ROLES:
        return query
    return query.filter(
        or_(
            Tool.department_access == None,
            Tool.department_access == "",
            Tool.department_access == current_user.department,
        )
    )

from typing import List

import strawberry

from .models.graph_text import GraphTextSection, load_graph_text
from .models.index import GraphIndex, get_index
from .models.versions import GraphVersion, get_versions


@strawberry.type
class Query:
    Index: GraphIndex = strawberry.field(resolver=get_index)
    Versions: List[GraphVersion] = strawberry.field(resolver=get_versions)
    TextSection: GraphTextSection = strawberry.field(resolver=load_graph_text)


schema = strawberry.Schema(query=Query)

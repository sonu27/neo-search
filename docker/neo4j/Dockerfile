FROM neo4j:3.3.2
RUN echo "dbms.memory.heap.initial_size=1024m" >> ./conf/neo4j.conf && \
    echo "dbms.memory.heap.max_size=1024m" >> ./conf/neo4j.conf && \
    echo "dbms.memory.pagecache.size=1024m" >> ./conf/neo4j.conf

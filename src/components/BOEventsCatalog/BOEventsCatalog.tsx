import React, { useEffect, useState } from 'react';
import { AuthApi } from '../../api/authApi';
import { Loader } from '../loader/loader';
import {Pagination, Card, Image, Text, Container, AspectRatio, Grid, Badge, Flex, Title } from '@mantine/core';
import './BOEventsCatalog.css';
import { ErrorMessage } from '../error/error';
import { format } from 'date-fns';
import { Page, isAPIStatusEnum } from '../main/main-page';
import { chunk } from '../eventsCatalog/eventsCatalog';

export const BOEventsCatalog: React.FC<Page> = ({setCurrentPage,setEventDetails}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [events, setEvents] = useState<any>([]);
  const [ticketsAmounts, setTicketsAmounts] = useState<number[]>([]);
  const [data, setData] = useState<any>(null);
  const [activePage, setPage] = useState(1);
  const [getMoreEvents, setGetMoreEvents] = useState<boolean>(true);


  const getEvents = async (limit:number = 50,skip:number = 0) => {
    const res = await AuthApi.getEvents();
    if(!isAPIStatusEnum(res)){
        setEvents(res.data);
        const allTicketsAmounts = await Promise.all(
            res.data.map((event:any) => getTicketsAmount(event._id))
        );
        setTicketsAmounts(allTicketsAmounts);
        setData(chunk(
            res.data,
            12
        ));
        return;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get Events, please try again');
    }
  }

  const getTicketsAmount = async (eventID: string) =>{
    const res = await AuthApi.getEventTicketsAmount(eventID);
    if(!isAPIStatusEnum(res)){
        return res.data.totalTicketsAmount;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get Events, please try again');
    }
}

  useEffect(() => {
    setIsLoading(true);
    getEvents().then(() => {setIsLoading(false)});
  }, []);

  useEffect(() => {
    if(getMoreEvents && data && activePage === data.length){
        const getMoreEvents = async () =>{
            setIsLoading(true);
            const res = await AuthApi.getEvents(50,events.length);
            if(!isAPIStatusEnum(res)){
                if(res.data.length === 0){
                    setGetMoreEvents(false);
                    return;
                }
                setEvents(events.concat(res.data));
                const allTicketsAmounts = await Promise.all(
                    res.data.map((event:any) => getTicketsAmount(event._id))
                );
                setTicketsAmounts(ticketsAmounts.concat(allTicketsAmounts));
                const newData = chunk(
                    data[activePage-1].concat(res.data),
                    12
                );
                data.pop();
                setData(data.concat(newData));
                return;
            }else{
                setIsLoading(false);
                setErrorMessage('Failed to get more events, please try again');
            }
        }
        getMoreEvents().then(() => {setIsLoading(false)});
      }
  }, [activePage]);

  const handleCardClick = (event: any) => {
    setEventDetails(event);
    setCurrentPage('BOEvent');
  }


  const cards = data ? data[activePage - 1]?.map((event:any,index:number) => {
    return(
        <Grid.Col  key={index+12*(activePage-1)} span={{ base: 12, xs: 6,sm: 4,md: 3, lg: 3, xg: 2 }}>
            <Card onClick={() => handleCardClick(event)} shadow="lg" p="md" radius="md" component="a" className="card">
                <AspectRatio ratio={1920 / 1080}>
                    <Image src={event.image} />
                </AspectRatio>
                <Badge className="rating" variant="gradient" gradient={{ from: 'blue', to: 'green' }}>
                    {event.category}
                </Badge>
                <Flex justify="center" align="center">
                    <Title order={4} className="title" mt={5}>
                        {event.title}
                    </Title>
                </Flex>
                <Text c="dimmed" size="xs" tt="uppercase" fw={700} mt="md">
                    {format(new Date(event.start_date), 'MMMM dd, yyyy, h:mm a')}
                </Text>
                <Flex justify="flex-start" align="center" style={{topmargin:"3px",gap:"3px"}}>
                    <Text fw={550} variant="gradient" gradient={{ from: 'blue', to: 'blue', deg: 0 }}>{ticketsAmounts[index+12*(activePage-1)]}</Text>
                    <Text> Tickets Available</Text>
                </Flex>
            </Card>
        </Grid.Col>
  )}) : null;
  
  return (
    <div>
      {isLoading 
      ? <Loader /> 
      : <Container fluid py="xl">
            {errorMessage && <ErrorMessage message={errorMessage}/>}
            <Grid  justify="flex-start" align="center" gutter="xl">
                {cards}
            </Grid>
            <Flex  style={{marginTop:'20'}} justify="center" align="center">
                <Pagination withEdges total={data?.length} value={activePage} onChange={setPage} mt="sm" />
            </Flex>
        </Container>
      }
    </div>
  );
};

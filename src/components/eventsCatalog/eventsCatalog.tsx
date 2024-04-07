import React, { useEffect, useState } from 'react';
import { AuthApi } from '../../api/authApi';
import { Loader } from '../loader/loader';
import {Pagination, Card, Image, Text, Container, AspectRatio, Grid, Badge, Flex, Title } from '@mantine/core';
import './eventsCatalog.css';
import { ErrorMessage } from '../error/error';
import { format } from 'date-fns';
import { Page, isAPIStatusEnum } from '../main/main-page';

export function chunk<T>(array: T[], size: number): T[][] {
    if (!array.length) {
      return [];
    }
    const head = array.slice(0, size);
    const tail = array.slice(size);
    return [head, ...chunk(tail, size)];
  }

export const EventsCatalog: React.FC<Page> = ({setCurrentPage,setEventDetails}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [availableEvents, setAvailableEvents] = useState<any>([]);
  const [ticketsAmounts, setTicketsAmounts] = useState<number[]>([]);
  const [ticketsLowestPrices, setTicktesLowestPrices] = useState<number[]>([]);
  const [data, setData] = useState<any>(null);
  const [activePage, setPage] = useState(1);
  const [getMoreEvents, setGetMoreEvents] = useState<boolean>(true);


  const getAvailableEvents = async (limit:number = 50,skip:number = 0) => {
    const res = await AuthApi.getAvailableEvents();
    if(!isAPIStatusEnum(res)){
        setAvailableEvents(res.data);
        const allTicketsAmounts = await Promise.all(
            res.data.map((event:any) => getTicketsAmount(event._id))
        );
        setTicketsAmounts(allTicketsAmounts);
        const allTicketsLowestPrices = await Promise.all(
            res.data.map((event:any) => getLowestPrice(event._id))
        );
        setTicktesLowestPrices(allTicketsLowestPrices);
        setData(chunk(
            res.data,
            12
        ));
        return;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get Available Events, please try again');
    }
  }

  const getTicketsAmount = async (eventID: string) =>{
    const res = await AuthApi.getEventTicketsAmount(eventID);
    if(!isAPIStatusEnum(res)){
        return res.data.totalTicketsAmount;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get Available Events, please try again');
    }
}

const getLowestPrice = async (eventID: string) =>{
    const res = await AuthApi.getEventLowestTicketPrice(eventID);
    if(!isAPIStatusEnum(res)){
        return res.data.minPrice;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get Available Events, please try again');
    }
}

  useEffect(() => {
    setIsLoading(true);
    getAvailableEvents().then(() => {setIsLoading(false)});
  }, []);

  useEffect(() => {
    if(getMoreEvents && data && activePage === data.length){
        const getMoreAvailableEvents = async () =>{
            setIsLoading(true);
            const res = await AuthApi.getAvailableEvents(50,availableEvents.length);
            if(!isAPIStatusEnum(res)){
                if(res.data.length === 0){
                    setGetMoreEvents(false);
                    return;
                }
                setAvailableEvents(availableEvents.concat(res.data));
                const allTicketsAmounts = await Promise.all(
                    res.data.map((event:any) => getTicketsAmount(event._id))
                );
                setTicketsAmounts(ticketsAmounts.concat(allTicketsAmounts));
                const allTicketsLowestPrices = await Promise.all(
                    res.data.map((event:any) => getLowestPrice(event._id))
                );
                setTicktesLowestPrices(ticketsLowestPrices.concat(allTicketsLowestPrices));
                const newData = chunk(
                    data[activePage-1].concat(res.data),
                    12
                );
                data.pop();
                setData(data.concat(newData));
                return;
            }else{
                setIsLoading(false);
                setErrorMessage('Failed to get more available Events, please try again');
            }
        }
        getMoreAvailableEvents().then(() => {setIsLoading(false)});
      }
  }, [activePage]);

  const handleCardClick = (event: any) => {
    setEventDetails(event);
    setCurrentPage('event');
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
                <Flex justify="flex-start" align="center" style={{gap:"3px"}}>
                    <Text>From</Text>
                    <Text fw={550} variant="gradient" gradient={{ from: 'blue', to: 'blue', deg: 0 }}>{ticketsLowestPrices[index+12*(activePage-1)]}$</Text>
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

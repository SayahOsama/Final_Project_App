import React, { useEffect, useState, useRef, createRef, MutableRefObject} from 'react';
import { AuthApi } from '../../api/authApi';
import { Loader } from '../loader/loader';
import { Card, Image, Text, Badge, Flex, Title, NumberInput, Button, Pagination, TextInput } from '@mantine/core';
import { ErrorMessage } from '../error/error';
import { format } from 'date-fns';
import { Page, isAPIStatusEnum } from '../main/main-page';
import { chunk } from '../eventsCatalog/eventsCatalog';

export interface ticketDetails{
  amount: number;
  ticketType: string;
  ticketPrice: string;
  eventTilte: string;
}

export const EventPage:React.FC<Page> = ({setCurrentPage,eventDetails,setTicketDetails,username}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [event, setEvent] = useState<any>(eventDetails);
  const [comments, setComments] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [activePage, setPage] = useState(1);
  const [getMoreComments, setGetMoreComments] = useState<boolean>(true);
  const [value, setValue] = useState('');

  const elementsRef = useRef(eventDetails.tickets.map(() => createRef()));
  const ref = useRef<HTMLInputElement>(null);

  const getEvent = async () => {
    const res = await AuthApi.getEvent(eventDetails._id);
    if(!isAPIStatusEnum(res)){
      setEvent(res.data);
      return;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get the more updated event, please try again');
    }
  }

  const getComments = async (limit:number = 50,skip:number = 0) => {
    const res = await AuthApi.getComments(eventDetails._id);
    if(!isAPIStatusEnum(res)){
      setComments(res.data);
      setData(chunk(
        res.data,
        3
      ));
      return;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get the event`s comments, please try again');
    }
  }

  useEffect(() => {
    setIsLoading(true);
    getEvent().then(() => {
      getComments().then(() => {setIsLoading(false)});});
  }, []);

  useEffect(() => {
    if(getMoreComments && data && activePage === data.length){
        const getMoreComments = async () =>{
            setIsLoading(true);
            const res = await AuthApi.getComments(eventDetails._id,50,comments?.length);
            if(!isAPIStatusEnum(res)){
                if(res.data.length === 0){
                    setGetMoreComments(false);
                    return;
                }
                setComments(comments.concat(res.data));
                const newData = chunk(
                    data[activePage-1].concat(res.data),
                    3
                );
                data.pop();
                setData(data.concat(newData));
                return;
            }else{
                setIsLoading(false);
                setErrorMessage('Failed to get more comments, please try again');
            }
        }
        getMoreComments().then(() => {setIsLoading(false)});
      }
  }, [activePage]);

  const handlePurchase = async (index: number,ticket: any) => {
    let amount = 1;
    if(elementsRef.current[index].current.value){
      amount = elementsRef.current[index].current.value;
    }

    setTicketDetails({
      amount: amount,
      ticketType: ticket.name,
      ticketPrice: ticket.price,
      eventTilte: event.title,
    });

    setCurrentPage('checkout');
  }

  const CommentsCards = () => {
    
    return data ? data[activePage-1]?.map((comment: any,index:number) => {
      const publishedDate = new Date(comment.date); // Assuming comment.date is in a valid date format
      const currentDate = new Date();
      const timeDifference = currentDate.getTime() - publishedDate.getTime();
      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(months / 12);
      const biggestTime = years != 0 ? years : months != 0 ? months : days != 0 ? days : hours != 0 ? hours : minutes != 0 ? minutes : seconds;
      const biggestTimeString = years != 0 ? "years" : months != 0 ? "months" : days != 0 ? "days" : hours != 0 ? "hours" : minutes != 0 ? "minutes" : "seconds";
      return(
        <Card key={index} shadow="lg" p="md" radius="md" component="a">
          <Title order={4} className="title" mt={5}>
              {comment.username}
          </Title>
          <Text style={{margin: '0px'}} c="dimmed" size="xs" fw={700} mt="md">
            {biggestTime} {biggestTimeString} Ago
          </Text>
          <Text size="xs" fw={700} mt="md">
            {comment.content}
          </Text>
        </Card>
      );
    }) : null;
  }

  const TicketsCards = () => {
     return event.tickets.map((ticket: any,index: number) =>{
      return(
        <Card key={index} shadow="lg" p="md" radius="md" component="a">
          <Flex justify="center" align="center" direction="column">
            <Title order={4} className="title" mt={5}>
              {ticket.name} Tickets
            </Title>
            <Text size="sm" fw={700} mt="md">
              Price: {ticket.price}$
            </Text>
            <Text size="sm" fw={700} mt="md">
              {ticket.quantity} tickets left!
            </Text>
            <NumberInput
                style={{marginTop: '7px'}}
                label="Buy Tickets:"
                placeholder="Choose Amount"
                allowDecimal={false}
                stepHoldDelay={500}
                stepHoldInterval={100}
                min={1}
                max={ticket.quantity}
                disabled={ticket.quantity==0}
                ref={elementsRef.current[index]}
              />
              <Button disabled={ticket.quantity==0} onClick={() => handlePurchase(index,ticket)} style={{marginTop: '7px'}} size="compact-xs" variant="filled">Buy Now</Button>
          </Flex>
        </Card>
      );
    })
  }

  const handleCommentPost = async () => {
    if(ref.current && ref.current.value == ''){
      return;
    }
    const res = await AuthApi.postComment(eventDetails._id,ref.current ? ref.current?.value : '',username);
    if(!isAPIStatusEnum(res)){
      setValue('');
      const copyComments = comments;
      copyComments.unshift({username: username, content: ref.current?.value, date: Date()});
      setComments(copyComments);
      setData(chunk(
        comments,
        3
      ));
      return;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to post the comment, please try again');
    }
  }

  return (
    <div>
      {isLoading 
      ? <Loader /> 
      :     <>
            {errorMessage && <ErrorMessage message={errorMessage}/>}
            <Flex justify="center" align="center" direction="column">
              <Card style={{width: '75%'}} shadow="lg" p="md" radius="md" component="a">
                  <Flex justify="flex-start" direction="row" columnGap="xl">
                    <Flex justify="flex-start" direction="column">
                      <Title order={3} className="title" mt={5}>
                        {event.title}
                      </Title>
                      <Image style={{minWidth:'250px', minHeight:'200px',maxWidth:'350px', maxHeight:'300px'}} src={event.image} />
                    </Flex>
                    <Flex style={{marginTop: '15px'}} justify="flex-start" direction="column">
                        <Text size="md" fw={700} mt="md">
                          Event Starts At: {format(new Date(event.start_date), 'MMMM dd, yyyy, h:mm a')}
                        </Text>
                        <Text size="md" fw={700} mt="md">
                          Event ends At: {format(new Date(event.end_date), 'MMMM dd, yyyy, h:mm a')}
                        </Text>
                        <Text size="sm" fw={700} mt="md">
                          Event By: {event.organizer}
                        </Text>
						<Text size="sm" fw={700} mt="md">
                          Event Location: {event.location}
                        </Text>
                        <Text lineClamp={3} size="xs" fw={700} mt="md">
                          Description: {event.description}
                        </Text>
                      </Flex>
                  </Flex>
                  <Badge className="rating" variant="gradient" gradient={{ from: 'blue', to: 'green' }}>
                      {event.category}
                  </Badge>
                  <Flex justify="flex-start" direction="row" >
                    <Text size="lg" fw={700} mt="md">
                      Buy Tickets:
                    </Text>
                  </Flex>
                  <Flex justify="space-around" direction="row" wrap="wrap" rowGap='lg' >
                      {TicketsCards()}
                  </Flex>
                  <Text size="sm" fw={700} mt="md">
                    Comments Section:
                  </Text>
                  <Flex style={{marginLeft: '20%'}} justify="flex-start" direction="column">
                    <TextInput
                      label="Add a Comment:"
                      placeholder="What's On Your Mind"
                      ref={ref}
                      value={value}
                      onChange={(event) => setValue(event.currentTarget.value)}
                    />
                    <Button onClick={() => handleCommentPost()} style={{ width: 'fit-content', marginBottom: '5px', marginTop: '2px'}} size="compact-xs" variant="filled">Post</Button>
                    {CommentsCards()}
                  </Flex>
                  <Flex style={{marginTop:'20px'}} justify="center" align="center">
                    <Pagination withEdges  total={data?.length} value={activePage} onChange={setPage} mt="sm" />
                  </Flex>
              </Card>
            </Flex>
            </>}
    </div>
  );
}

/** @jsxImportSource theme-ui */
import { Container, Text, Flex } from '@theme-ui/components';
import React from 'react';

const EventSlider = (props) => {
    return (
        <Container sx={{
            backgroundColor: "secondary", 
            width: "100%",
            height: "100%",
            py: "20px"
        }}>
            <Flex sx={{
                flexDirection: "row",
                justifyContent: "center",
                height: "100%",
                }}>
                <Text sx={{
                    color: "white",
                    variant: "styles.h3",
                    fontWeight: "300"
                }}>Next Event: </Text>
            </Flex>
        </Container>
    )
}
export default EventSlider